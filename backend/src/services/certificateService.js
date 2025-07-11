const puppeteer = require('puppeteer');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Configuração do Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Função para gerar PDF do certificado
const generateCertificatePDF = async (certificateData) => {
    let browser = null;
    let page = null;
    
    try {
        console.log('🎨 Gerando HTML do certificado...');
        const html = generateCertificateHTML(certificateData);
        
        console.log('🚀 Iniciando Puppeteer...');
        browser = await puppeteer.launch({
            executablePath: process.env.NODE_ENV === 'production' ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--single-process',
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