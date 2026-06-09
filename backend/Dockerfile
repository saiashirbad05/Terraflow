FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
# Expose the port the app listens on (default 3002)
EXPOSE 3002
ENV PORT=3002
CMD ["node", "server.js"]
