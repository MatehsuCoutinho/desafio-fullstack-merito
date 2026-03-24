# Desafio Fullstack Mérito — Dashboard de Investimentos

Este projeto foi desenvolvido como parte do desafio técnico da Mérito, com o objetivo de demonstrar habilidades práticas em desenvolvimento Fullstack, organização de código e boas práticas.

![DashBoard Img](/docs/meritodashboard.png)

---

## Sobre o desafio

A aplicação permite o gerenciamento de investimentos, incluindo:

* Cadastro de fundos
* Registro de movimentações (aportes e resgates)
* Visualização do saldo da carteira

O foco principal está em:

* Lógica de negócio
* Estrutura da aplicação
* Clareza e organização do código

---

## Tecnologias utilizadas

### Backend

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL (Docker) ou SQLite

### Frontend

* React
* TypeScript
* Vite

### DevOps

* Docker
* GitHub Actions (CI/CD)

---

## Estrutura do projeto

```
.
├── backend/
├── frontend/
├── docs/
│   └── postman_collection.json
└── .github/workflows/deploy.yml
```

---

## Funcionalidades

### Fundos de Investimento

* Cadastro com:

  * Nome
  * Código (ticker)
  * Tipo
  * Valor da cota

### Movimentações

* Registro de:

  * Aportes
  * Resgates
* Dados:

  * Data
  * Valor
  * Tipo
* Atualização de:

  * Quantidade de cotas
  * Saldo da carteira

### Dashboard

* Tabela de movimentações (ordenada por data)
* Saldo consolidado da carteira
* Interface React consumindo API REST

### Integração externa

* Endpoint `/api/brapi` para consumo de dados externos

---

## Como rodar o projeto

### Backend

```bash
cd backend

cp .env.example .env

npm install

npx prisma migrate dev

npx prisma db seed  

npm run dev
```

Endpoints disponíveis:

* `GET/POST/PUT/DELETE /api/funds`
* `GET/POST/PUT/DELETE /api/transactions`
* `GET /api/brapi`

---

### Frontend

```bash
cd frontend

npm install
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

---

## Testes

```bash
cd backend
npm test
```

Arquivos:

* `funds.test.ts`
* `transactions.test.ts`

---

## Testando a API (Postman)

O projeto possui uma coleção do Postman disponível na pasta:

```
docs/postman_collection.json
```

### Como usar:

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo `postman_collection.json` dentro da pasta `docs`
4. Execute as requisições disponíveis

Isso facilita testar todos os endpoints da aplicação de forma rápida.

---

## Docker

Para subir backend e banco de dados com Docker:

```bash
cd backend
docker compose up --build
```

---

## CI/CD

Pipeline configurado em:

```
.github/workflows/deploy.yml
```

Etapas:

* Instalação de dependências
* Geração do Prisma Client
* Execução de migrations
* Execução de testes
* Build da imagem Docker
* Simulação de deploy

---

## Variáveis de ambiente

Arquivo `.env`:

```
DATABASE_URL=
PORT=
BRAPI_TOKEN=
POSTGRES_PASSWORD=
```

---

## Decisões técnicas

* Arquitetura em camadas (controllers, services, routes)
* Prisma para acesso ao banco com tipagem forte
* Separação clara entre frontend e backend
* Uso de middlewares (ex: rate limiter)
* Testes automatizados para regras de negócio

---

## Entrega


* Repositório: `desafio-fullstack-merito`
* Projeto pronto para execução local

---

## Considerações finais

O projeto foi desenvolvido priorizando organização, legibilidade e boas práticas, com foco na lógica de negócio conforme proposto no desafio.
