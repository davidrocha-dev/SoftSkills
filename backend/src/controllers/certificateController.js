const { Certificate, User, Course, Enrollment } = require('../models');
const { generateAndUploadCertificate } = require('../services/certificateService');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const getCourseEnrollments = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        const enrollments = await Enrollment.findAll({
            where: {
                courseId: courseId,
                status: 'Ativo'
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

        const existingCertificates = await Certificate.findAll({
            where: {
                courseId: courseId
            },
            attributes: ['workerNumber']
        });

        const workersWithCertificates = new Set(existingCertificates.map(cert => cert.workerNumber));

        const eligibleEnrollments = enrollments.filter(enrollment => 
            !workersWithCertificates.has(enrollment.user.workerNumber)
        );
        
        res.json(eligibleEnrollments);
    } catch (error) {
        console.error('Erro ao buscar inscrições:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

const issueCertificate = async (req, res) => {
    try {
        const { courseId, workerNumber, grade, observation } = req.body;

        if (!courseId || !workerNumber || grade === undefined) {
            console.log('Dados obrigatórios em falta');
            return res.status(400).json({ 
                message: 'Dados obrigatórios: courseId, workerNumber e grade' 
            });
        }

        if (grade < 0 || grade > 20) {
            console.log('Nota inválida:', grade);
            return res.status(400).json({ 
                message: 'A nota deve estar entre 0 e 20' 
            });
        }

        if (grade < 9.5) {
            console.log('Nota insuficiente para certificado:', grade);
            return res.status(400).json({
                message: 'A nota mínima para emissão de certificado é 9.5'
            });
        }

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
            console.log('Inscrição não encontrada');
            return res.status(404).json({ 
                message: 'Utilizador não encontrado ou não inscrito no curso' 
            });
        }

        const existingCertificate = await Certificate.findOne({
            where: {
                courseId: courseId,
                workerNumber: workerNumber
            }
        });

        if (existingCertificate) {
            console.log('Certificado já existe para este utilizador');
            return res.status(409).json({ 
                message: 'Já existe um certificado emitido para este utilizador neste curso' 
            });
        }


        const user = await User.findOne({ where: { workerNumber: workerNumber } });
        const course = await Course.findByPk(courseId);
        
        if (!user || !course) {
            console.log('Utilizador ou curso não encontrado');
            return res.status(404).json({ 
                message: 'Utilizador ou curso não encontrado' 
            });
        }

        const certificate = await Certificate.create({
            courseId: courseId,
            workerNumber: workerNumber,
            grade: grade,
            observation: observation || null
        });

        console.log(`Certificado criado com ID: ${certificate.id}`);

        try {
            const certificateData = {
                userName: user.name,
                courseTitle: course.title,
                grade: grade,
                issueDate: new Date().toLocaleDateString('pt-BR'),
                certificateId: certificate.id
            };

            const pdfUrl = await generateAndUploadCertificate(certificateData);
            
            console.log('PDF gerado e enviado para Cloudinary');
            console.log('   - URL:', pdfUrl);


            await certificate.update({ pdfUrl: pdfUrl });

            console.log('Certificado atualizado com URL do PDF');

            res.status(201).json({
                message: 'Certificado emitido com sucesso',
                certificate: certificate,
                pdfUrl: pdfUrl
            });

        } catch (pdfError) {
            console.error('Erro ao gerar PDF:', pdfError);
            
            await certificate.destroy();
            
            return res.status(500).json({ 
                message: 'Erro ao gerar certificado PDF',
                details: pdfError.message
            });
        }

    } catch (error) {
        console.error('Erro geral ao emitir certificado:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor',
            details: error.message
        });
    }
};

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

const revokeCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        
        console.log(`[RevokeCertificate] Iniciando revogação do certificado ID: ${certificateId}`);
        
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
            console.log(`[RevokeCertificate] Certificado não encontrado: ${certificateId}`);
            return res.status(404).json({ 
                success: false,
                message: 'Certificado não encontrado' 
            });
        }

        console.log(`[RevokeCertificate] Certificado encontrado para: ${certificate.user.name}`);

        if (certificate.pdfUrl) {
            try {
                console.log(`[RevokeCertificate] Eliminando PDF do Cloudinary: ${certificate.pdfUrl}`);
                
                const urlParts = certificate.pdfUrl.split('/');
                const filenameWithExtension = urlParts[urlParts.length - 1];
                const publicId = `certificates/certificate_${certificateId}`;
                
                console.log(`[RevokeCertificate] Public ID para eliminar: ${publicId}`);
                
                const result = await cloudinary.uploader.destroy(publicId, {
                    resource_type: 'raw'
                });
                
                console.log(`[RevokeCertificate] Resultado da eliminação do Cloudinary:`, result);
                
                if (result.result === 'ok' || result.result === 'not found') {
                    console.log(`[RevokeCertificate] PDF eliminado com sucesso do Cloudinary`);
                } else {
                    console.warn(`[RevokeCertificate] Resultado inesperado da eliminação: ${result.result}`);
                }
                
                            } catch (cloudinaryError) {
                    console.error(`[RevokeCertificate] Erro ao eliminar PDF do Cloudinary:`, cloudinaryError);
                }
        }

        await certificate.destroy();
        
        console.log(`[RevokeCertificate] Certificado eliminado da base de dados: ${certificateId}`);

        res.json({
            success: true,
            message: 'Certificado revogado com sucesso',
            certificateId: certificateId
        });

    } catch (error) {
        console.error('[RevokeCertificate] Erro ao revogar certificado:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro interno do servidor',
            details: error.message
        });
    }
};

module.exports = {
    getCourseEnrollments,
    issueCertificate,
    getCourseCertificates,
    downloadCertificate,
    revokeCertificate
}; 