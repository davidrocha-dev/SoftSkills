const htmlPdf = require('html-pdf-node');
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

// Função para gerar PDF usando html-pdf-node com configuração específica para Render
const generateCertificatePDF = async (certificateData) => {
    try {
        console.log('🎨 Gerando HTML do certificado...');
        const html = generateCertificateHTML(certificateData);
        
        console.log('🚀 Iniciando html-pdf-node...');
        
        const options = {
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0',
                right: '0',
                bottom: '0',
                left: '0'
            },
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-images',
                '--disable-javascript',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-field-trial-config',
                '--disable-ipc-flooding-protection'
            ]
        };
        
        const file = { content: html };
        
        console.log('📄 Gerando PDF...');
        const pdfBuffer = await htmlPdf.generatePdf(file, options);
        
        console.log(`✅ PDF gerado com sucesso! Tamanho: ${pdfBuffer.length} bytes`);
        return pdfBuffer;
        
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
        console.log('🎯 Iniciando geração e upload do certificado (html-pdf-node simples)...');
        
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