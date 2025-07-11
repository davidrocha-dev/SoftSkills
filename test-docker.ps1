Write-Host "🐳 Testando Docker para PINT2 Backend..." -ForegroundColor Green

# Parar containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker stop pint2-backend 2>$null
docker rm pint2-backend 2>$null

# Build da imagem
Write-Host "🔨 Fazendo build da imagem Docker..." -ForegroundColor Yellow
docker build -t pint2-backend ./backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
    
    # Executar container
    Write-Host "🚀 Executando container..." -ForegroundColor Yellow
    docker run -d `
        --name pint2-backend `
        -p 3000:3000 `
        -e NODE_ENV=production `
        -e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true `
        -e PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser-stable `
        pint2-backend
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Container iniciado com sucesso!" -ForegroundColor Green
        Write-Host "🌐 Aplicação disponível em: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "🏥 Health check: http://localhost:3000/api/health" -ForegroundColor Cyan
        
        # Aguardar um pouco e testar health check
        Write-Host "⏳ Aguardando aplicação inicializar..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        # Testar health check
        Write-Host "🔍 Testando health check..." -ForegroundColor Yellow
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Health check passou!" -ForegroundColor Green
            } else {
                Write-Host "❌ Health check falhou!" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Health check falhou!" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "📋 Para ver os logs:" -ForegroundColor Cyan
        Write-Host "docker logs pint2-backend" -ForegroundColor White
        Write-Host ""
        Write-Host "🛑 Para parar o container:" -ForegroundColor Cyan
        Write-Host "docker stop pint2-backend" -ForegroundColor White
        
    } else {
        Write-Host "❌ Erro ao executar container!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Erro no build da imagem!" -ForegroundColor Red
    exit 1
} 