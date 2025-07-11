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
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'portrait',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        // Fundo
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#667eea');
        doc.fillColor('white').rect(30, 30, doc.page.width - 60, doc.page.height - 60).fill();

        // --- Calcular altura total do conteúdo central ---
        let contentHeight = 0;
        const spacing = doc.currentLineHeight() * 0.5;
        const pageWidth = doc.page.width - 100;

        doc.font('Helvetica-Bold').fontSize(24);
        contentHeight += doc.heightOfString('Softinsa - Plataforma de Formação', { width: pageWidth });
        contentHeight += spacing;

        doc.fontSize(40);
        contentHeight += doc.heightOfString('CERTIFICADO', { width: pageWidth });
        contentHeight += doc.currentLineHeight() * 0.2;

        doc.fontSize(16);
        contentHeight += doc.heightOfString('de Conclusão de Curso', { width: pageWidth });
        contentHeight += doc.currentLineHeight() * 1.5;

        doc.fontSize(16);
        contentHeight += doc.heightOfString('Certificamos que', { width: pageWidth });
        contentHeight += spacing;

        doc.fontSize(28);
        contentHeight += doc.heightOfString(userName.toUpperCase(), { width: pageWidth });
        contentHeight += spacing;

        doc.fontSize(16);
        contentHeight += doc.heightOfString('concluiu com sucesso o curso', { width: pageWidth });
        contentHeight += spacing;

        doc.fontSize(22);
        contentHeight += doc.heightOfString(courseTitle, { width: pageWidth });
        contentHeight += spacing;

        doc.fontSize(16);
        contentHeight += doc.heightOfString('com a classificação de', { width: pageWidth });
        contentHeight += doc.currentLineHeight() * 0.2;

        doc.fontSize(20);
        contentHeight += doc.heightOfString(`${grade}/20`, { width: pageWidth });
        contentHeight += doc.currentLineHeight() * 2;

        // --- Centralizar verticalmente ---
        const availableHeight = doc.page.height - 60; // 30px de margem em cima e baixo
        let startY = 30 + (availableHeight - contentHeight) / 2;
        doc.y = startY;

        // --- Escrever o conteúdo centralizado ---
        doc.font('Helvetica-Bold').fontSize(24).fillColor('#3498db');
        doc.text('Softinsa - Plataforma de Formação', { align: 'center' });
        doc.moveDown(0.5);

        doc.fontSize(40).fillColor('#2c3e50');
        doc.text('CERTIFICADO', { align: 'center' });
        doc.moveDown(0.2);

        doc.fontSize(16).fillColor('#7f8c8d');
        doc.text('de Conclusão de Curso', { align: 'center' });
        doc.moveDown(1.5);

        doc.fontSize(16).fillColor('#34495e');
        doc.text('Certificamos que', { align: 'center' });
        doc.moveDown(0.5);

        doc.fontSize(28).fillColor('#3498db');
        doc.text(userName.toUpperCase(), { align: 'center' });
        doc.moveDown(0.5);

        doc.fontSize(16).fillColor('#34495e');
        doc.text('concluiu com sucesso o curso', { align: 'center' });
        doc.moveDown(0.5);

        doc.fontSize(22).fillColor('#2c3e50');
        doc.text(courseTitle, { align: 'center' });
        doc.moveDown(0.5);

        doc.fontSize(16).fillColor('#34495e');
        doc.text('com a classificação de', { align: 'center' });
        doc.moveDown(0.2);

        doc.fontSize(20).fillColor('#27ae60');
        doc.text(`${grade}/20`, { align: 'center' });
        doc.moveDown(2);

        // Rodapé
        doc.fontSize(12).fillColor('#7f8c8d');
        doc.text(`Data de Emissão:\n${issueDate}`, 50, doc.page.height - 100, { align: 'left' });
        doc.text(`ID: ${certificateId}`, -50, doc.page.height - 100, { align: 'right' });

        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });
    } catch (error) {
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
    generateCertificatePDF,
    generateAndUploadCertificate
}; 