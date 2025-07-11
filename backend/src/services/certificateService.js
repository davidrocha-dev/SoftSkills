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

// Função para gerar HTML do certificado
const generateCertificateHTML = (certificateData) => {
    const { userName, courseTitle, grade, issueDate, certificateId } = certificateData;
    
    return `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificado - ${userName}</title>
        <style>
            @page {
                size: A4;
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
                font-family: 'Arial', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .certificate {
                width: 210mm;
                height: 297mm;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 40px;
                box-sizing: border-box;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #3498db;
                margin-bottom: 10px;
            }
            .title {
                font-size: 48px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .subtitle {
                font-size: 18px;
                color: #7f8c8d;
                font-style: italic;
            }
            .content {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 40px 0;
            }
            .description {
                font-size: 20px;
                color: #34495e;
                margin-bottom: 20px;
                line-height: 1.6;
            }
            .name {
                font-size: 36px;
                font-weight: bold;
                color: #3498db;
                margin: 20px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .course-title {
                font-size: 28px;
                font-weight: bold;
                color: #2c3e50;
                margin: 20px 0;
                line-height: 1.4;
            }
            .grade {
                font-size: 22px;
                color: #34495e;
                margin: 20px 0;
            }
            .grade strong {
                color: #27ae60;
                font-size: 26px;
            }
            .footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 14px;
                color: #7f8c8d;
            }
            .date {
                text-align: left;
            }
            .certificate-id {
                text-align: right;
            }
            .border-decoration {
                position: absolute;
                top: 20px;
                left: 20px;
                right: 20px;
                bottom: 20px;
                border: 2px solid #3498db;
                border-radius: 15px;
                pointer-events: none;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="border-decoration"></div>
            <div class="header">
                <div class="logo">Softinsa - Plataforma de Formação</div>
                <div class="title">Certificado</div>
                <div class="subtitle">de Conclusão de Curso</div>
            </div>
            
            <div class="content">
                <div class="description">
                    Certificamos que
                </div>
                <div class="name">${userName}</div>
                <div class="description">
                    concluiu com sucesso o curso
                </div>
                <div class="course-title">${courseTitle}</div>
                <div class="grade">
                    com a classificação de <strong>${grade}/20</strong>
                </div>
            </div>
            
            <div class="footer">
                <div class="date">
                    <strong>Data de Emissão:</strong><br>
                    ${issueDate}
                </div>
                <div class="certificate-id">
                    <strong>ID:</strong> ${certificateId}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

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
    generateAndUploadCertificate,
    generateCertificateHTML
}; 