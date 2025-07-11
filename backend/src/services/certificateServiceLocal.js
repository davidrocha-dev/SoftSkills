const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

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
                <div class="logo">PINT2 - Plataforma de Formação</div>
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

// Função para gerar PDF do certificado
const generateCertificatePDF = async (certificateData) => {
    try {
        console.log('🎨 Gerando HTML do certificado...');
        const html = generateCertificateHTML(certificateData);
        
        console.log('🚀 Iniciando Puppeteer...');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ],
            timeout: 30000
        });
        
        console.log('📄 Criando nova página...');
        const page = await browser.newPage();
        
        page.setDefaultTimeout(30000);
        page.setDefaultNavigationTimeout(30000);
        
        console.log('📏 Definindo viewport...');
        await page.setViewport({
            width: 1200,
            height: 800,
            deviceScaleFactor: 1
        });
        
        console.log('📝 Carregando HTML na página...');
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                await page.setContent(html, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 30000 
                });
                break;
            } catch (error) {
                retryCount++;
                console.log(`⚠️ Tentativa ${retryCount} falhou, tentando novamente...`);
                if (retryCount >= maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log('⏳ Aguardando carregamento completo...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        if (page.isClosed()) {
            throw new Error('Página foi fechada inesperadamente');
        }
        
        console.log('📄 Gerando PDF...');
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0',
                right: '0',
                bottom: '0',
                left: '0'
            },
            preferCSSPageSize: true,
            displayHeaderFooter: false
        });
        
        console.log(`✅ PDF gerado com sucesso! Tamanho: ${pdfBuffer.length} bytes`);
        await browser.close();
        
        return pdfBuffer;
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        throw new Error(`Falha ao gerar certificado PDF: ${error.message}`);
    }
};

// Função para salvar PDF localmente
const saveCertificateLocally = async (pdfBuffer, certificateId) => {
    try {
        console.log('📁 Criando diretório para certificados...');
        const certificatesDir = path.join(__dirname, '../../certificates');
        
        if (!fs.existsSync(certificatesDir)) {
            fs.mkdirSync(certificatesDir, { recursive: true });
        }
        
        const filePath = path.join(certificatesDir, `certificate_${certificateId}.pdf`);
        
        console.log('💾 Salvando PDF localmente...');
        fs.writeFileSync(filePath, pdfBuffer);
        
        console.log('✅ PDF salvo localmente:', filePath);
        return filePath;
        
    } catch (error) {
        console.error('❌ Erro ao salvar PDF localmente:', error);
        throw new Error(`Falha ao salvar certificado: ${error.message}`);
    }
};

// Função principal para gerar e salvar certificado localmente
const generateAndSaveCertificate = async (certificateData) => {
    try {
        console.log('🎯 Iniciando geração e salvamento local do certificado...');
        
        const pdfBuffer = await generateCertificatePDF(certificateData);
        const filePath = await saveCertificateLocally(pdfBuffer, certificateData.certificateId);
        
        console.log('🎉 Certificado gerado e salvo com sucesso!');
        return filePath;
        
    } catch (error) {
        console.error('❌ Erro ao gerar e salvar certificado:', error);
        throw error;
    }
};

module.exports = {
    generateAndSaveCertificate,
    generateCertificateHTML,
    generateCertificatePDF
}; 