# Usa Node LTS
FROM node:20-alpine

# Diretório da aplicação
WORKDIR /app

# Copia package.json primeiro (melhor cache)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia resto do projeto
COPY . .

# Gera client do Prisma
RUN npx prisma generate

# Build do TS
RUN npm run build

# Porta da API
EXPOSE 3333

# Comando de start
CMD ["npm", "start"]