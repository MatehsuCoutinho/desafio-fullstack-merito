# Desafio Fullstack Mérito — Dashboard de Investimentos

Projeto desenvolvido como parte do desafio técnico da Mérito, com o objetivo de demonstrar habilidades práticas em desenvolvimento Fullstack, organização de código e boas práticas.

![Dashboard](/docs/meritodashboard.png)

---

## Sobre o projeto

Aplicação para gerenciamento de investimentos, permitindo:

- Cadastro de fundos (via integração com a BRAPI ou manualmente)
- Registro de movimentações (aportes e resgates)
- Visualização do saldo da carteira em tempo real
- Sincronização automática do valor de cota via API externa

---

## Tecnologias utilizadas

### Backend
- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL (via Docker) ou SQLite

### Frontend
- React + TypeScript
- Vite

### DevOps
- Docker
- GitHub Actions (CI/CD)

---

## Estrutura do projeto

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── routes/
│   ├── prisma/
│   ├── .env.example
│   └── docker-compose.yml
├── frontend/
│   └── src/
│       ├── pages/
│       ├── services/
│       └── types/
├── docs/
│   └── postman_collection.json
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## Funcionalidades

### Fundos de Investimento
- Cadastro via ticker com busca automática na [BRAPI](https://brapi.dev)
- Cadastro manual quando o ticker não é encontrado na API externa (informando nome, tipo e valor da cota)
- Sincronização do valor de cota com a BRAPI
- Remoção de fundos sem movimentações vinculadas

### Movimentações
- Registro de aportes e resgates por fundo
- Dados armazenados: data, valor, tipo (APORTE ou RESGATE)
- Atualização automática de:
  - Quantidade de cotas por fundo
  - Saldo consolidado da carteira
- Validação de cotas e saldo suficientes para resgates
- Estorno de movimentações com reversão automática de saldo e cotas

### Dashboard
- Tabela de movimentações ordenada por data
- Saldo consolidado da carteira
- Interface React consumindo API REST

### Integração externa
- Endpoint `/api/brapi/search/:ticker` para consulta de dados de ativos na BRAPI

---

## Como rodar o projeto

### 1. Localmente (sem Docker)

#### Backend

```bash
cd backend

cp .env.example .env
# Preencha as variáveis de ambiente no arquivo .env

npm install

npx prisma migrate dev

npx prisma db seed

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

### 2. Com Docker

```bash
cd backend
docker compose up --build
```

O Docker sobe o backend junto com o banco de dados PostgreSQL. O frontend deve ser executado localmente conforme as instruções acima.

---

## Testes

```bash
cd backend
npm test
```

Arquivos de teste:
- `funds.test.ts` — regras de negócio de fundos
- `transactions.test.ts` — regras de negócio de movimentações

---

## Testando a API (Postman)

A coleção do Postman está disponível em:

```
docs/postman_collection.json
```

Para importar:

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo `postman_collection.json`
4. Execute as requisições disponíveis

---

## CI/CD

Pipeline configurado em `.github/workflows/deploy.yml` com as etapas:

1. Instalação de dependências
2. Geração do Prisma Client
3. Execução de migrations
4. Execução de testes
5. Build da imagem Docker
6. Simulação de deploy

---

## Variáveis de ambiente

Crie um arquivo `.env` na pasta `backend/` com base no `.env.example`:

```env
DATABASE_URL=        # Ex: postgresql://user:password@localhost:5432/merito
PORT=                # Ex: 3000
BRAPI_TOKEN=         # Token de acesso à API da BRAPI (https://brapi.dev)
POSTGRES_PASSWORD=   # Senha do PostgreSQL (usado pelo Docker)
```

---

## Exemplos de uso da API

### Criar fundo via BRAPI (ticker encontrado automaticamente)

```http
POST /api/funds
Content-Type: application/json

{
  "ticker": "MXRF11"
}
```

### Criar fundo manualmente (ticker não encontrado na BRAPI)

```http
POST /api/funds
Content-Type: application/json

{
  "ticker": "MXRF11",
  "name": "Maxi Renda FII",
  "type": "Fundo Imobiliário",
  "cota": 10.50
}
```

> O campo `cota` é obrigatório no cadastro manual e define o valor inicial da cota do fundo.

### Sincronizar cota de um fundo com a BRAPI

```http
PATCH /api/funds/:id/sync
```

### Registrar movimentação

```http
POST /api/transactions
Content-Type: application/json

{
  "date": "2024-03-01",
  "type": "APORTE",
  "value": 1000,
  "fundId": "fund-uuid"
}
```

> `type` aceita apenas `APORTE` ou `RESGATE`.

### Estornar movimentação

```http
DELETE /api/transactions/:id
```

---

## Decisões técnicas

- **Arquitetura em camadas** — controllers, services e routes separados por responsabilidade
- **Prisma ORM** — acesso ao banco com tipagem forte e migrations versionadas
- **Integração com BRAPI** — busca automática de dados do ativo; fallback para cadastro manual quando não encontrado
- **Transações atômicas** — aportes, resgates e estornos usam `prisma.$transaction` para garantir consistência entre tabelas
- **Rate limiter** — middleware aplicado nas rotas da API
- **Testes automatizados** — cobertura das principais regras de negócio