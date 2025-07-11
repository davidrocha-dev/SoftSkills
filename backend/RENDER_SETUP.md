# Configuração do Render.com para PINT2 Backend

## Problema Resolvido ✅

O Puppeteer precisava do Chrome instalado para gerar PDFs. No ambiente do Render.com, o Chrome não vem pré-instalado.

## Solução Implementada

### Abordagem Otimizada

- **Usamos Puppeteer** com configuração específica para Render
- **Download automático do Chromium** correto durante a instalação
- **Configuração otimizada** para o ambiente do Render.com

### Arquivos Modificados

1. **`certificateServiceSimple.js`** - Novo serviço principal

   - Usa Puppeteer com configuração otimizada
   - Download automático do Chromium correto
   - Argumentos de linha de comando para estabilidade

2. **`certificateController.js`** - Simplificado

   - Remove lógica de fallback complexa
   - Usa apenas o serviço simples

3. **`package.json`** - Dependências e scripts otimizados

   - Inclui `puppeteer` para download automático do Chromium
   - Script `postinstall` para baixar Chrome automaticamente
   - Script `start` que executa configuração antes do servidor
   - Mantém `puppeteer-core` para compatibilidade
   - Mantém `html-pdf-node` como alternativa

4. **`setup-puppeteer.js`** - Script de configuração
   - Configura o Puppeteer automaticamente no Render
   - Cria diretórios necessários
   - Define variáveis de ambiente
   - Instala Chrome se necessário

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

```
npm install
```

**Nota**: O script `postinstall` irá automaticamente baixar o Chrome necessário.

### Start Command

```
npm start
```

**Nota**: O script `setup-puppeteer.js` será executado automaticamente antes do servidor iniciar.

## Como Funciona Agora

1. **Geração de PDF**: Usa Puppeteer com Chromium automático
2. **Download automático**: O Puppeteer baixa o Chromium correto durante `npm install`
3. **Configuração otimizada**: Argumentos específicos para estabilidade no Render
4. **Upload para Cloudinary**: Funciona normalmente

## Teste

Após o deploy, teste a geração de certificados. Os logs devem mostrar:

```
🎯 Iniciando geração e upload do certificado (Puppeteer)...
🎨 Gerando HTML do certificado...
🚀 Iniciando Puppeteer...
🏭 Ambiente de produção detectado, usando configuração otimizada...
📄 Criando nova página...
📏 Definindo viewport...
📝 Carregando HTML na página...
⏳ Aguardando carregamento completo...
📄 Gerando PDF...
✅ PDF gerado com sucesso! Tamanho: XXXX bytes
☁️ Fazendo upload para Cloudinary...
✅ Upload para Cloudinary concluído!
🎉 Certificado gerado e enviado para Cloudinary com sucesso!
```

## Vantagens da Nova Abordagem

1. **Confiabilidade**: Puppeteer com Chromium automático
2. **Simplicidade**: Download automático durante instalação
3. **Performance**: Configuração otimizada para Render
4. **Manutenção**: Código robusto e bem estruturado

## Troubleshooting

### Se ainda houver problemas:

1. Verifique as configurações do Cloudinary
2. Confirme que o diretório `/tmp` tem permissões de escrita
3. Verifique se todas as dependências estão instaladas

## Dependências

- `puppeteer`: Para geração de PDFs com Chromium automático
- `cloudinary`: Para upload dos PDFs
- `puppeteer-core`: Mantido para compatibilidade
- `html-pdf-node`: Mantido como alternativa
