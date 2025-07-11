const { Certificate, User, Course, Enrollment } = require('../models');
const { generateAndUploadCertificate } = require('../services/certificateServiceSimple');

// Listar inscritos de um curso para emissão de certificados
const getCourseEnrollments = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        console.log(`🔍 Buscando inscrições para curso ID: ${courseId}`);
        
        // Buscar inscrições ativas do curso com dados do usuário
        const enrollments = await Enrollment.findAll({
            where: {
                courseId: courseId,
                status: 'Ativo' // Apenas inscrições ativas
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'workerNumber']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'description']
                }
            ],
            order: [['enrollmentDate', 'ASC']]
        });

        // Buscar certificados existentes para este curso
        const existingCertificates = await Certificate.findAll({
            where: {
                courseId: courseId
            },
            attributes: ['workerNumber']
        });

        // Criar um Set com os números de trabalhador que já têm certificado
        const workersWithCertificates = new Set(existingCertificates.map(cert => cert.workerNumber));

        // Filtrar inscrições removendo os que já têm certificado
        const eligibleEnrollments = enrollments.filter(enrollment => 
            !workersWithCertificates.has(enrollment.user.workerNumber)
        );

        console.log(`✅ Encontradas ${enrollments.length} inscrições ativas`);
        console.log(`📋 ${existingCertificates.length} já têm certificado`);
        console.log(`🎯 ${eligibleEnrollments.length} elegíveis para certificado`);
        
        res.json(eligibleEnrollments);
    } catch (error) {
        console.error('❌ Erro ao buscar inscrições:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

// Emitir certificado para um usuário
const issueCertificate = async (req, res) => {
    try {
        const { courseId, workerNumber, grade, observation } = req.body;

        console.log(`🎯 Iniciando emissão de certificado:`);
        console.log(`   - Course ID: ${courseId}`);
        console.log(`   - Worker Number: ${workerNumber}`);
        console.log(`   - Grade: ${grade}`);
        console.log(`   - Observation: ${observation}`);

        // Validar dados obrigatórios
        if (!courseId || !workerNumber || grade === undefined) {
            console.log('❌ Dados obrigatórios em falta');
            return res.status(400).json({ 
                message: 'Dados obrigatórios: courseId, workerNumber e grade' 
            });
        }

        // Validar nota (0-20)
        if (grade < 0 || grade > 20) {
            console.log('❌ Nota inválida:', grade);
            return res.status(400).json({ 
                message: 'A nota deve estar entre 0 e 20' 
            });
        }

        console.log('🔍 Verificando inscrição do utilizador...');

        // Verificar se o usuário está inscrito no curso
        const enrollment = await Enrollment.findOne({
            where: {
                courseId: courseId,
                status: 'Ativo'
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    where: { workerNumber: workerNumber }
                }
            ]
        });

        if (!enrollment) {
            console.log('❌ Inscrição não encontrada');
            return res.status(404).json({ 
                message: 'Utilizador não encontrado ou não inscrito no curso' 
            });
        }

        console.log('✅ Inscrição encontrada:', enrollment.user.name);

        // Verificar se já existe um certificado para este usuário neste curso
        const existingCertificate = await Certificate.findOne({
            where: {
                courseId: courseId,
                workerNumber: workerNumber
            }
        });

        if (existingCertificate) {
            console.log('❌ Certificado já existe para este utilizador');
            return res.status(409).json({ 
                message: 'Já existe um certificado emitido para este utilizador neste curso' 
            });
        }

        console.log('🔍 Buscando dados do usuário e curso...');

        // Buscar dados do usuário e curso para o certificado
        const user = await User.findOne({ where: { workerNumber: workerNumber } });
        const course = await Course.findByPk(courseId);
        
        if (!user || !course) {
            console.log('❌ Usuário ou curso não encontrado');
            return res.status(404).json({ 
                message: 'Utilizador ou curso não encontrado' 
            });
        }

        console.log('✅ Dados encontrados:');
        console.log(`   - Usuário: ${user.name}`);
        console.log(`   - Curso: ${course.title}`);

        // Criar o certificado primeiro
        console.log('📝 Criando registro do certificado...');
        const certificate = await Certificate.create({
            courseId: courseId,
            workerNumber: workerNumber,
            grade: grade,
            observation: observation || null
        });

        console.log(`✅ Certificado criado com ID: ${certificate.id}`);

        try {
            // Gerar dados para o certificado
            const certificateData = {
                userName: user.name,
                courseTitle: course.title,
                grade: grade,
                issueDate: new Date().toLocaleDateString('pt-BR'),
                certificateId: certificate.id
            };

            console.log('🎨 Gerando PDF do certificado...');
            console.log('   - Dados do certificado:', certificateData);

            // Gerar PDF e fazer upload para Cloudinary
            console.log('☁️ Fazendo upload para Cloudinary...');
            const pdfUrl = await generateAndUploadCertificate(certificateData);
            
            console.log('✅ PDF gerado e enviado para Cloudinary');
            console.log('   - URL:', pdfUrl);

            // Atualizar o certificado com o link do PDF
            await certificate.update({ pdfUrl: pdfUrl });

            console.log('✅ Certificado atualizado com URL do PDF');

            res.status(201).json({
                message: 'Certificado emitido com sucesso',
                certificate: certificate,
                pdfUrl: pdfUrl
            });

        } catch (pdfError) {
            // Se falhar ao gerar PDF, remover o certificado criado
            console.error('❌ Erro ao gerar PDF:', pdfError);
            console.log('🗑️ Removendo certificado criado...');
            
            await certificate.destroy();
            
            return res.status(500).json({ 
                message: 'Erro ao gerar certificado PDF',
                details: pdfError.message
            });
        }

    } catch (error) {
        console.error('❌ Erro geral ao emitir certificado:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor',
            details: error.message
        });
    }
};

// Listar certificados de um curso
const getCourseCertificates = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        const certificates = await Certificate.findAll({
            where: {
                courseId: courseId
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'workerNumber']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'description']
                }
            ],
            order: [['id', 'ASC']]
        });

        res.json(certificates);
    } catch (error) {
        console.error('Erro ao buscar certificados:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

// Baixar certificado por ID
const downloadCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        
        const certificate = await Certificate.findByPk(certificateId, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'workerNumber']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'description']
                }
            ]
        });

        if (!certificate) {
            return res.status(404).json({ message: 'Certificado não encontrado' });
        }

        if (!certificate.pdfUrl) {
            return res.status(404).json({ message: 'PDF do certificado não disponível' });
        }

        res.json({
            certificate: certificate,
            downloadUrl: certificate.pdfUrl
        });

    } catch (error) {
        console.error('Erro ao buscar certificado:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

module.exports = {
    getCourseEnrollments,
    issueCertificate,
    getCourseCertificates,
    downloadCertificate
}; 