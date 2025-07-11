const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

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
    let browser = null;
    let page = null;
    
    try {
        console.log('🎨 Gerando HTML do certificado...');
        const html = generateCertificateHTML(certificateData);
        
        console.log('🚀 Iniciando Puppeteer...');
        browser = await puppeteer.launch({
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
        page = await browser.newPage();
        
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
        return pdfBuffer;
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        throw new Error(`Falha ao gerar certificado PDF: ${error.message}`);
    } finally {
        try {
            if (page && !page.isClosed()) {
                console.log('🔒 Fechando página...');
                await page.close();
            }
        } catch (error) {
            console.log('⚠️ Erro ao fechar página:', error.message);
        }
        
        try {
            if (browser) {
                console.log('🔒 Fechando browser...');
                await browser.close();
            }
        } catch (error) {
            console.log('⚠️ Erro ao fechar browser:', error.message);
        }
    }
};

// Função para salvar PDF temporariamente
const savePDFTemporarily = async (pdfBuffer, certificateId) => {
    try {
        console.log('📁 Criando diretório temporário...');
        const tempDir = path.join(__dirname, '../../temp');
        
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const filePath = path.join(tempDir, `certificate_${certificateId}.pdf`);
        
        console.log('💾 Salvando PDF temporariamente...');
        fs.writeFileSync(filePath, pdfBuffer);
        
        console.log('✅ PDF salvo temporariamente:', filePath);
        return filePath;
        
    } catch (error) {
        console.error('❌ Erro ao salvar PDF temporariamente:', error);
        throw new Error(`Falha ao salvar certificado: ${error.message}`);
    }
};

// Função para configurar transporter de email
const createEmailTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Função para enviar email com certificado
const sendCertificateEmail = async (userEmail, userName, courseTitle, grade, pdfPath) => {
    try {
        console.log('📧 Configurando envio de email...');
        
        const transporter = createEmailTransporter();
        
        // Mensagem de parabéns personalizada
        const congratulationsMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px;">
                <h1 style="margin: 0; font-size: 28px;">🎉 Parabéns, ${userName}! 🎉</h1>
                <p style="font-size: 18px; margin: 10px 0;">Você concluiu com sucesso o curso!</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
                <h2 style="color: #2c3e50; margin-top: 0;">📚 Detalhes do Certificado</h2>
                <p><strong>Curso:</strong> ${courseTitle}</p>
                <p><strong>Classificação:</strong> ${grade}/20</p>
                <p><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                
                <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #27ae60; margin-top: 0;">🏆 Excelente Trabalho!</h3>
                    <p>Você demonstrou dedicação e compromisso durante todo o curso. Este certificado é o reconhecimento do seu esforço e da sua capacidade de aprender e crescer profissionalmente.</p>
                </div>
                
                <p><strong>O certificado em PDF está anexado a este email.</strong></p>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #856404;"><strong>💡 Dica:</strong> Guarde este certificado em local seguro, pois é um documento oficial que comprova sua qualificação profissional.</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #7f8c8d;">
                <p>PINT2 - Plataforma de Formação</p>
                <p>Obrigado por escolher nossa plataforma para sua formação!</p>
            </div>
        </div>
        `;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `🎉 Parabéns! Seu Certificado - ${courseTitle}`,
            html: congratulationsMessage,
            attachments: [
                {
                    filename: `certificado_${courseTitle.replace(/\s+/g, '_')}.pdf`,
                    path: pdfPath
                }
            ]
        };
        
        console.log('📤 Enviando email...');
        const result = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email enviado com sucesso!');
        console.log('📧 Message ID:', result.messageId);
        
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        throw new Error(`Falha ao enviar email: ${error.message}`);
    }
};

// Função para eliminar arquivo temporário
const deleteTemporaryFile = async (filePath) => {
    try {
        console.log('🗑️ Eliminando arquivo temporário...');
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('✅ Arquivo temporário eliminado:', filePath);
        } else {
            console.log('⚠️ Arquivo não encontrado para eliminar:', filePath);
        }
        
    } catch (error) {
        console.error('❌ Erro ao eliminar arquivo temporário:', error);
        // Não lançar erro aqui, pois não é crítico
    }
};

// Função principal para gerar, enviar e eliminar
const generateAndSendCertificate = async (certificateData, userEmail) => {
    let tempFilePath = null;
    
    try {
        console.log('🎯 Iniciando processo completo de certificado...');
        console.log('📋 Dados:', certificateData);
        console.log('📧 Email:', userEmail);
        
        // 1. Gerar PDF
        console.log('\n📄 Passo 1: Gerando PDF...');
        const pdfBuffer = await generateCertificatePDF(certificateData);
        
        // 2. Salvar temporariamente
        console.log('\n💾 Passo 2: Salvando temporariamente...');
        tempFilePath = await savePDFTemporarily(pdfBuffer, certificateData.certificateId);
        
        // 3. Enviar por email
        console.log('\n📧 Passo 3: Enviando por email...');
        await sendCertificateEmail(
            userEmail,
            certificateData.userName,
            certificateData.courseTitle,
            certificateData.grade,
            tempFilePath
        );
        
        // 4. Eliminar arquivo temporário
        console.log('\n🗑️ Passo 4: Eliminando arquivo temporário...');
        await deleteTemporaryFile(tempFilePath);
        
        console.log('\n🎉 Processo completo finalizado com sucesso!');
        return {
            success: true,
            message: 'Certificado gerado e enviado por email com sucesso!'
        };
        
    } catch (error) {
        console.error('❌ Erro no processo:', error);
        
        // Tentar eliminar arquivo temporário mesmo em caso de erro
        if (tempFilePath) {
            await deleteTemporaryFile(tempFilePath);
        }
        
        throw error;
    }
};

module.exports = {
    generateAndSendCertificate,
    generateCertificateHTML,
    generateCertificatePDF
}; 