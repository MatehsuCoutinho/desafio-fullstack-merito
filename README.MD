# Desafio Fullstack Mérito — Dashboard de Investimentos

Este projeto foi desenvolvido como parte do desafio técnico da Mérito, com o objetivo de demonstrar habilidades práticas em desenvolvimento Fullstack, organização de código e boas práticas.

![DashBoard Img](/docs/meritodashboard.png)

---

## Sobre o projeto

A aplicação permite o gerenciamento de investimentos, incluindo:

* Cadastro de fundos
* Registro de movimentações (aportes e resgates)
* Visualização do saldo da carteira em tempo real

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

* Cadastro de fundos com:

  * Nome
  * Código (ticker)
  * Tipo
  * Valor da cota

### Movimentações

* Registro de aportes e resgates
* Dados armazenados:

  * Data
  * Valor
  * Tipo (aporte ou resgate)
* Atualização automática de:

  * Quantidade de cotas
  * Saldo da carteira

### Dashboard

* Tabela de movimentações (ordenada por data)
* Saldo consolidado da carteira
* Interface React consumindo API REST

### Integração externa

* Endpoint `/api/brapi` para consumo de dados externos sobre fundos

---

## Como rodar o projeto

O projeto pode ser executado de **duas formas**:

### 1. Rodando localmente (sem Docker)

#### Backend

```bash
cd backend

cp .env.example .env

definir suas variáveis de ambiente

npm install

npx prisma migrate dev

npm run seed  

npm run dev
```

#### Frontend

```bash
cd frontend

npm install
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

---

### 2. Rodando com Docker

```bash
cd backend
docker compose up --build
```

* O Docker sobe o backend junto com o banco de dados PostgreSQL.
* O frontend pode ser executado localmente ou você pode adicionar um container adicional, se desejar.

---

## Testes

```bash
cd backend
npm test
```

Arquivos de teste:

* `funds.test.ts`
* `transactions.test.ts`

---

## Testando a API (Postman)

O projeto possui uma coleção do Postman disponível na pasta:

```
docs/postman_collection.json
```

### Como usar

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo `postman_collection.json`
4. Execute as requisições disponíveis

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
* Simulação de deploy (`echo "Deploy"`)

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

## Exemplo de uso da API

### Criar fundo

```http
POST /api/funds
Content-Type: application/json

SEM API EXTERNA:

{
  "name": "Fundo XP",
  "ticker": "MXRF11",
  "type": "Renda Fixa",
  "cota": 100.50
}

COM API EXTERNA:

{
  "ticker": "MXRF11"
}
```

### Registrar movimentação

```http
POST /api/transactions
Content-Type: application/json

{
  "date": "2024-03-01",
  "type": "APORTE",
  "value": 1000,
  "fundId": "fund-id"
}
```

---

## Entrega

* Repositório: `desafio-fullstack-merito`
* Projeto pronto para execução local ou via Docker

