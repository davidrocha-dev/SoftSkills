const PDFDocument = require('pdfkit');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Configuração do Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



// Função para gerar PDF do certificado usando PDFKit
const generateCertificatePDF = async (certificateData) => {
    const { userName, courseTitle, grade, issueDate, certificateId } = certificateData;
    
    try {
        console.log('🎨 Gerando PDF do certificado com PDFKit...');
        
        // Criar um novo documento PDF
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'portrait',
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            }
        });

        // Criar um buffer para armazenar o PDF
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        
        // Configurar fontes e estilos
        doc.font('Helvetica');
        
        // Adicionar fundo gradiente (simulado com retângulos)
        doc.rect(0, 0, doc.page.width, doc.page.height)
           .fill('#667eea');
        
        // Adicionar retângulo branco para o certificado
        const margin = 30;
        const certWidth = doc.page.width - (margin * 2);
        const certHeight = doc.page.height - (margin * 2);
        
        doc.rect(margin, margin, certWidth, certHeight)
           .fill('white')
           .stroke('#3498db', 2);
        
        // Posicionar conteúdo
        let y = margin + 60;
        
        // Cabeçalho
        doc.fontSize(24)
           .fill('#3498db')
           .text('Softinsa - Plataforma de Formação', doc.page.width / 2, y, { align: 'center' });
        
        y += 40;
        doc.fontSize(48)
           .fill('#2c3e50')
           .text('CERTIFICADO', doc.page.width / 2, y, { align: 'center' });
        
        y += 30;
        doc.fontSize(18)
           .fill('#7f8c8d')
           .text('de Conclusão de Curso', doc.page.width / 2, y, { align: 'center' });
        
        // Conteúdo principal
        y += 80;
        doc.fontSize(20)
           .fill('#34495e')
           .text('Certificamos que', doc.page.width / 2, y, { align: 'center' });
        
        y += 40;
        doc.fontSize(36)
           .fill('#3498db')
           .text(userName.toUpperCase(), doc.page.width / 2, y, { align: 'center' });
        
        y += 50;
        doc.fontSize(20)
           .fill('#34495e')
           .text('concluiu com sucesso o curso', doc.page.width / 2, y, { align: 'center' });
        
        y += 40;
        doc.fontSize(28)
           .fill('#2c3e50')
           .text(courseTitle, doc.page.width / 2, y, { align: 'center' });
        
        y += 50;
        doc.fontSize(22)
           .fill('#34495e')
           .text(`com a classificação de `, doc.page.width / 2, y, { align: 'center' });
        
        y += 30;
        doc.fontSize(26)
           .fill('#27ae60')
           .text(`${grade}/20`, doc.page.width / 2, y, { align: 'center' });
        
        // Rodapé
        y = doc.page.height - margin - 80;
        
        // Data de emissão
        doc.fontSize(14)
           .fill('#7f8c8d')
           .text('Data de Emissão:', margin + 20, y);
        
        y += 20;
        doc.fontSize(14)
           .fill('#2c3e50')
           .text(issueDate, margin + 20, y);
        
        // ID do certificado
        doc.fontSize(14)
           .fill('#7f8c8d')
           .text('ID:', doc.page.width - margin - 100, y - 20, { align: 'right' });
        
        doc.fontSize(14)
           .fill('#2c3e50')
           .text(certificateId, doc.page.width - margin - 20, y - 20, { align: 'right' });
        
        // Finalizar o documento
        doc.end();
        
        // Aguardar o documento ser finalizado
        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                console.log(`✅ PDF gerado com sucesso! Tamanho: ${pdfBuffer.length} bytes`);
                resolve(pdfBuffer);
            });
            
            doc.on('error', (error) => {
                console.error('❌ Erro ao gerar PDF:', error);
                reject(error);
            });
        });
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        throw new Error(`Falha ao gerar certificado PDF: ${error.message}`);
    }
};

// Função para salvar PDF localmente
const savePDFLocally = async (pdfBuffer, certificateId) => {
    try {
        console.log('📁 Criando diretório temporário...');
        const tempDir = path.join(__dirname, '../../temp');
        
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const filePath = path.join(tempDir, `certificate_${certificateId}.pdf`);
        
        console.log('💾 Salvando PDF localmente...');
        fs.writeFileSync(filePath, pdfBuffer);
        
        console.log('✅ PDF salvo localmente:', filePath);
        return filePath;
        
    } catch (error) {
        console.error('❌ Erro ao salvar PDF localmente:', error);
        throw new Error(`Falha ao salvar PDF localmente: ${error.message}`);
    }
};

// Função para fazer upload do PDF para Cloudinary
const uploadToCloudinary = async (filePath, certificateId) => {
    try {
        console.log('☁️ Fazendo upload para Cloudinary...');
        
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'certificates',
            public_id: `certificate_${certificateId}`,
            resource_type: 'raw',
            format: 'pdf'
        });
        
        console.log('✅ Upload para Cloudinary concluído!');
        console.log('📄 URL:', result.secure_url);
        
        return result.secure_url;
        
    } catch (error) {
        console.error('❌ Erro ao fazer upload para Cloudinary:', error);
        throw new Error(`Falha ao fazer upload para Cloudinary: ${error.message}`);
    }
};

// Função para eliminar arquivo local
const deleteLocalFile = async (filePath) => {
    try {
        console.log('🗑️ Eliminando arquivo local...');
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('✅ Arquivo local eliminado:', filePath);
        } else {
            console.log('⚠️ Arquivo local não encontrado:', filePath);
        }
        
    } catch (error) {
        console.error('❌ Erro ao eliminar arquivo local:', error);
        // Não lançar erro aqui, pois não é crítico
    }
};

// Função principal para gerar, salvar localmente, fazer upload e limpar
const generateAndUploadCertificate = async (certificateData) => {
    let localFilePath = null;
    
    try {
        console.log('🎯 Iniciando geração e upload do certificado...');
        
        // 1. Gerar PDF
        const pdfBuffer = await generateCertificatePDF(certificateData);
        
        // 2. Salvar localmente
        localFilePath = await savePDFLocally(pdfBuffer, certificateData.certificateId);
        
        // 3. Fazer upload para Cloudinary
        const pdfUrl = await uploadToCloudinary(localFilePath, certificateData.certificateId);
        
        console.log('🎉 Certificado gerado e enviado para Cloudinary com sucesso!');
        return pdfUrl;
        
    } catch (error) {
        console.error('❌ Erro ao gerar e fazer upload do certificado:', error);
        throw error;
    } finally {
        // 4. Sempre eliminar arquivo local
        if (localFilePath) {
            await deleteLocalFile(localFilePath);
        }
    }
};

module.exports = {
    generateAndUploadCertificate
}; 