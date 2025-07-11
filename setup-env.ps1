Write-Host "🔧 Configurando variáveis de ambiente..." -ForegroundColor Green

# Verificar se o ficheiro .env já existe
if (Test-Path "backend\.env") {
    Write-Host "⚠️ Ficheiro .env já existe!" -ForegroundColor Yellow
    $response = Read-Host "Queres sobrescrever? (s/N)"
    if ($response -ne "s" -and $response -ne "S") {
        Write-Host "❌ Operação cancelada." -ForegroundColor Red
        exit 0
    }
}

# Copiar o ficheiro de exemplo
if (Test-Path "backend\env.example") {
    Copy-Item "backend\env.example" "backend\.env"
    Write-Host "✅ Ficheiro .env criado com sucesso!" -ForegroundColor Green
    Write-Host "📝 Edita o ficheiro backend\.env com os teus valores reais" -ForegroundColor Cyan
} else {
    Write-Host "❌ Ficheiro env.example não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔑 Variáveis importantes a configurar:" -ForegroundColor Yellow
Write-Host "   - DATABASE_URL" -ForegroundColor White
Write-Host "   - JWT_SECRET" -ForegroundColor White
Write-Host "   - CLOUDINARY_CLOUD_NAME" -ForegroundColor White
Write-Host "   - CLOUDINARY_API_KEY" -ForegroundColor White
Write-Host "   - CLOUDINARY_API_SECRET" -ForegroundColor White 