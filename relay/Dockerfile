FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY relay-server.js ./
ENV PORT=8080
EXPOSE 8080
CMD ["node", "relay-server.js"]
