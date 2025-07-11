# Configuração do Render.com para PINT2 Backend

## Problema

O Puppeteer precisa do Chrome instalado para gerar PDFs. No ambiente do Render.com, o Chrome não vem pré-instalado.

## Soluções Implementadas

### 1. Configuração do Puppeteer

- Mudamos de `puppeteer` para `puppeteer-core`
- Adicionamos detecção automática do ambiente de produção
- Em produção, usa o Chrome do sistema (`/usr/bin/google-chrome-stable`)

### 2. Instalação do Chrome no Render

O arquivo `render.yaml` já está configurado para instalar o Chrome durante o build:

```yaml
buildCommand: |
  npm install
  apt-get update
  apt-get install -y wget gnupg
  wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
  apt-get update
  apt-get install -y google-chrome-stable
```

### 3. Fallback com html-pdf-node

Se o Puppeteer falhar, o sistema automaticamente tenta usar `html-pdf-node` como alternativa.

## Configuração no Render Dashboard

### Variáveis de Ambiente

Certifique-se de que estas variáveis estão configuradas no Render:

```
NODE_ENV=production
RENDER=true
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

### Build Command

Se não estiver usando o `render.yaml`, configure manualmente:

```
npm install && apt-get update && apt-get install -y wget gnupg && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && apt-get update && apt-get install -y google-chrome-stable
```

### Start Command

```
npm start
```

## Teste

Após o deploy, teste a geração de certificados. Os logs devem mostrar:

1. **Sucesso com Puppeteer:**

   ```
   🏭 Ambiente de produção detectado, usando Chrome do sistema...
   ✅ PDF gerado com Puppeteer e enviado para Cloudinary
   ```

2. **Fallback para html-pdf-node:**
   ```
   ⚠️ Puppeteer falhou, tentando com html-pdf-node...
   ✅ PDF gerado com html-pdf-node e enviado para Cloudinary
   ```

## Troubleshooting

### Se o Chrome não for encontrado:

1. Verifique se o build command foi executado corretamente
2. Confirme que a variável `NODE_ENV=production` está definida
3. Verifique os logs do build no Render

### Se ambos os métodos falharem:

1. Verifique as configurações do Cloudinary
2. Confirme que o diretório `/tmp` tem permissões de escrita
3. Verifique se todas as dependências estão instaladas

## Dependências

- `puppeteer-core`: Para usar o Chrome do sistema
- `html-pdf-node`: Como fallback
- `cloudinary`: Para upload dos PDFs
