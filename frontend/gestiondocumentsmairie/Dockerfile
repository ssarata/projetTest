# Étape 1 : build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NEXT_PUBLIC_API_URL=https://api.exemple.com
ENV NEXT_DISABLE_ESLINT=true

RUN npm run build

# Étape 2 : run

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]
