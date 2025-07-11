# Deploy no Render com Docker

Este projeto está configurado para funcionar no Render usando Docker para resolver problemas com o Puppeteer.

## Configuração do Docker

### Backend Dockerfile

O backend usa a imagem oficial do Puppeteer que já inclui o Chrome:

- `ghcr.io/puppeteer/puppeteer:24.12.1`
- Chrome pré-instalado em `/usr/bin/chromium-browser-stable`
- Variáveis de ambiente configuradas automaticamente

### Variáveis de Ambiente Necessárias

No Render, configure as seguintes variáveis de ambiente:

#### Backend

```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser-stable
DATABASE_URL=sua_url_do_banco
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
JWT_SECRET=seu_jwt_secret
```

## Passos para Deploy

### 1. Conectar ao Render

1. Acede ao [Render Dashboard](https://dashboard.render.com)
2. Clica em "New +" e seleciona "Web Service"
3. Conecta o teu repositório GitHub

### 2. Configurar o Serviço

- **Name**: `pint2-backend`
- **Environment**: `Docker`
- **Region**: Escolhe a região mais próxima
- **Branch**: `main` (ou a branch que queres usar)
- **Root Directory**: `backend` (se o Dockerfile estiver na pasta backend)
- **Dockerfile Path**: `Dockerfile`

### 3. Configurar Variáveis de Ambiente

Adiciona todas as variáveis de ambiente necessárias na secção "Environment Variables".

### 4. Configurar Health Check

- **Health Check Path**: `/api/health`

### 5. Deploy

Clica em "Create Web Service" e aguarda o build e deploy.

## Troubleshooting

### Problemas Comuns

1. **Puppeteer não encontra o Chrome**

   - Verifica se `PUPPETEER_EXECUTABLE_PATH` está configurado corretamente
   - Confirma que estás a usar a imagem Docker correta

2. **Erro de memória**

   - O Render tem limites de memória, considera usar um plano superior
   - Otimiza o código para usar menos memória

3. **Timeout no build**
   - O build pode demorar devido ao download das dependências
   - Verifica se o `.dockerignore` está configurado corretamente

### Logs

Para ver os logs no Render:

1. Vai ao teu serviço no dashboard
2. Clica na aba "Logs"
3. Procura por erros relacionados com Puppeteer

## Desenvolvimento Local

Para testar localmente com Docker:

```bash
# Build da imagem
docker build -t pint2-backend ./backend

# Executar container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  -e PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser-stable \
  pint2-backend
```

## Estrutura dos Ficheiros

```
PINT2/
├── backend/
│   ├── Dockerfile              # Configuração Docker para backend
│   ├── .dockerignore           # Ficheiros a ignorar no build
│   └── src/
│       ├── app.js              # Servidor principal com health check
│       └── services/
│           └── certificateService.js  # Serviço de certificados com Puppeteer
├── render.yaml                 # Configuração automática do Render
└── DEPLOY_RENDER.md           # Este ficheiro
```
