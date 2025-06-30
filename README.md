# Feira de Trocas Comunitária - Backend 
## 1. Visão Geral
API backend para a "Feira de Trocas Comunitária", um projeto prático do Bootcamp FullStack da Avanti. O sistema visa facilitar a troca de itens entre usuários, promovendo consumo consciente e laços comunitários.

 ## 2. Tecnologias

- Node.js

- Express.js

- Prisma ORM

- PostgreSQL

## 3. Modelagem de Dados

### O banco de dados é composto pelas entidades:

- **Usuario**: Gerencia informações dos usuários.

- **Item**: Representa os produtos para troca, com detalhes e responsável.

- **Proposta**: Gerencia as solicitações de troca entre dois itens e usuários envolvidos, incluindo status  (pendente, aceita, recusada).

## 4. Como Rodar o Backend

### Pré-requisitos: Node.js, npm, PostgreSQL.

        1. Clonar: git clone <https://github.com/souzagabs/back_time7.git>

        2. Instalar: `npm install`

        3. Configurar .env: Criar e preencher DATABASE_URL="postgresql://<USUARIO>:<SENHA>@localhost:5432/<NOME_DB>".

        4. Migrar DB: `npx prisma migrate reset`.

        5. Gerar Prisma Client: `npx prisma generate`.

        6. Iniciar: `npm run dev` (desenvolvimento) ou `npm start` (produção).

## 5. Endpoints da API

### Todos os endpoints seguem a estrutura MVC.

- **Usuários (`/usuarios`):**

| Método | Rota             | Descrição            |
|--------|------------------|----------------------|
| POST   | `/usuarios`      | Cria novo usuário   |
| GET    | `/usuarios`      | Lista todos os usuários   |
| GET    | `/usuarios/:id`  | Detalhes de usuário específico  |
| PUT    | `/usuarios/:id`  | Atualiza usuário existente    |
| DELETE | `/usuarios/:id`  | Exclui usuário       |

- **Itens (`/itens`):**

| Método | Rota             | Descrição                                 |
|--------|------------------|-------------------------------------------|
| POST   | `/itens`         | Cadastra um novo item                               |
| GET    | `/itens`         | Lista todos os itens disponíveis (com filtros e busca) |
| GET    | `/itens/:id`     | Detalhes de um item específico            |
| PUT    | `/itens/:id`     | Atualiza um item existente                |
| DELETE | `/itens/:id`     | Exclui um item                            |

## 6. Contribuições da Equipe

