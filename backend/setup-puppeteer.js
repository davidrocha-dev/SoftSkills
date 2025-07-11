const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando Puppeteer para Render.com...');

try {
    // Verificar se estamos no Render
    if (process.env.RENDER) {
        console.log('🏭 Ambiente Render detectado');
        
        // Criar diretório para Puppeteer
        const puppeteerDir = '/tmp/puppeteer';
        if (!fs.existsSync(puppeteerDir)) {
            fs.mkdirSync(puppeteerDir, { recursive: true });
            console.log('✅ Diretório Puppeteer criado:', puppeteerDir);
        }
        
        // Configurar variáveis de ambiente
        // O Puppeteer já baixa o Chromium automaticamente na primeira execução
        const puppeteerExecutablePath = path.join(process.cwd(), 'node_modules', 'puppeteer', '.local-chromium', 'linux-*', 'chrome-linux', 'chrome');
        
        console.log('🔧 Configurando caminho do executável:', puppeteerExecutablePath);
        process.env.PUPPETEER_EXECUTABLE_PATH = puppeteerExecutablePath;
        
        console.log('✅ Configuração do Puppeteer concluída');
    } else {
        console.log('💻 Ambiente local detectado - configuração automática');
    }
    
} catch (error) {
    console.error('❌ Erro na configuração do Puppeteer:', error);
    process.exit(1);
} 