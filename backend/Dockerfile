FROM ghcr.io/puppeteer/puppeteer:24.12.1

# Definir variáveis de ambiente para o Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser-stable
ENV NODE_ENV=production

# Criar diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretório temp para certificados
RUN mkdir -p temp

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "src/app.js"]