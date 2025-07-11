# Configuração do Render.com para PINT2 Backend

## Problema Resolvido ✅

O Puppeteer precisava do Chrome instalado para gerar PDFs. No ambiente do Render.com, o Chrome não vem pré-instalado.

## Solução Implementada

### Abordagem Simplificada

- **Removemos a dependência do Chrome** completamente
- **Usamos apenas `html-pdf-node`** que funciona sem instalação adicional
- **Configuração otimizada** para o ambiente do Render.com

### Arquivos Modificados

1. **`certificateServiceSimple.js`** - Novo serviço principal

   - Usa apenas `html-pdf-node`
   - Configuração otimizada para Render
   - Argumentos de linha de comando para estabilidade

2. **`certificateController.js`** - Simplificado

   - Remove lógica de fallback complexa
   - Usa apenas o serviço simples

3. **`package.json`** - Dependências limpas
   - Remove `puppeteer` (mantém apenas `puppeteer-core` para compatibilidade)
   - Mantém `html-pdf-node`

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

### Start Command

```
npm start
```

## Como Funciona Agora

1. **Geração de PDF**: Usa `html-pdf-node` diretamente
2. **Sem dependência do Chrome**: Não precisa instalar Chrome no servidor
3. **Configuração otimizada**: Argumentos específicos para estabilidade no Render
4. **Upload para Cloudinary**: Funciona normalmente

## Teste

Após o deploy, teste a geração de certificados. Os logs devem mostrar:

```
🎯 Iniciando geração e upload do certificado (html-pdf-node simples)...
🎨 Gerando HTML do certificado...
🚀 Iniciando html-pdf-node...
📄 Gerando PDF...
✅ PDF gerado com sucesso! Tamanho: XXXX bytes
☁️ Fazendo upload para Cloudinary...
✅ Upload para Cloudinary concluído!
🎉 Certificado gerado e enviado para Cloudinary com sucesso!
```

## Vantagens da Nova Abordagem

1. **Simplicidade**: Menos dependências, menos pontos de falha
2. **Confiabilidade**: Funciona consistentemente no Render
3. **Performance**: Mais rápido, menos recursos necessários
4. **Manutenção**: Código mais simples de manter

## Troubleshooting

### Se ainda houver problemas:

1. Verifique as configurações do Cloudinary
2. Confirme que o diretório `/tmp` tem permissões de escrita
3. Verifique se todas as dependências estão instaladas

## Dependências

- `html-pdf-node`: Para geração de PDFs
- `cloudinary`: Para upload dos PDFs
- `puppeteer-core`: Mantido para compatibilidade (não usado ativamente)
