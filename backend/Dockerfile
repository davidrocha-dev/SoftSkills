from ghcr.io/puppeteer/puppeteer:24.12.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser-stable

WORKDIR /usr/src/app

COPY package.json ./
RUN npm ci
COPY . .
CMD ["nodemon", "src/app.js"]