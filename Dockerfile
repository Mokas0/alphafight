FROM node:20-alpine
WORKDIR /app

# Install relay deps first so this layer is cached when only index.html changes.
COPY relay/package.json ./
RUN npm install --omit=dev

# Server code.
COPY relay/relay-server.js ./

# Static files served at /. Anything in ./public is reachable over HTTP.
RUN mkdir -p public
COPY index.html ./public/index.html

ENV PORT=8080
ENV PUBLIC_DIR=/app/public
EXPOSE 8080

CMD ["node", "relay-server.js"]
