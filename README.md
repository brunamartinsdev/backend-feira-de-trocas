# Feira de Trocas Comunitária - Backend

### **1. Visão Geral**

API backend para a "Feira de Trocas Comunitária", um projeto prático do Bootcamp FullStack da Avanti. O sistema visa facilitar a troca de itens entre usuários, promovendo consumo consciente e laços comunitários.

### **2. Tecnologias**

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL
* Cloudinary: Serviço de gerenciamento de mídia em nuvem para upload e hospedagem de imagens.
* Multer: Middleware para Node.js que lida com upload de arquivos (`multipart/form-data`).

### **3. Modelagem de Dados**

O banco de dados é composto pelas entidades:

* **Usuario**: Gerencia informações dos usuários.
* **Item**: Representa os objetos disponibilizados para troca, com detalhes como nome, descrição, categoria e o usuário responsável. Inclui também um campo para a URL da foto do item.
* **Proposta**: Gerencia as solicitações de troca entre dois itens e usuários envolvidos, incluindo status (pendente, aceita, recusada).

### Diagramas do Modelo de Dados

Para uma visualização clara da estrutura do banco de dados e dos relacionamentos entre as entidades, consulte os diagramas abaixo:

#### Modelo Conceitual

*(Este diagrama representa a visão das entidades e seus relacionamentos, focando nos conceitos do negócio.)*

![Modelo Conceitual](docs/modelagem/modelo_conceitual.png)

#### Modelo Lógico

*(Este diagrama detalha a estrutura das tabelas no banco de dados, incluindo chaves primárias (PK) e estrangeiras (FK), conforme implementado no Prisma.)*

![Modelo Lógico](docs/modelagem/modelo_logico.png)

### **4. Como Rodar o Backend**

### Pré-requisitos: Node.js, npm, PostgreSQL.

1.  **Clonar:** `git clone https://github.com/souzagabs/back_time7.git`
2.  **Instalar:** `npm install`
3.  **Configurar `.env`:** Criar e preencher `DATABASE_URL="postgresql://<USUARIO>:<SENHA>@localhost:5432/<NOME_DB>"`.
    * Adicionar também as credenciais do Cloudinary:
        ```
        CLOUDINARY_CLOUD_NAME="seu_cloud_name_aqui"
        CLOUDINARY_API_KEY="sua_api_key_aqui"
        CLOUDINARY_API_SECRET="sua_api_secret_aqui"
        ```
4.  **Migrar DB:** `npx prisma migrate reset` (irá apagar dados de desenvolvimento).
5.  **Gerar Prisma Client:** `npx prisma generate`.
6.  **Iniciar:** `npm run dev` (desenvolvimento) ou `npm start` (produção).

### **5. Endpoints da API**

Todos os endpoints seguem a estrutura MVC.

* **Usuários (`/usuarios`):**

| Método | Rota               | Descrição                      |
| :----- | :----------------- | :----------------------------- |
| POST   | `/usuarios`        | Cria novo usuário |
| GET    | `/usuarios`        | Lista todos os usuários |
| GET    | `/usuarios/:id`    | Detalhes de usuário específico |
| PUT    | `/usuarios/:id`    | Atualiza usuário existente     |
| DELETE | `/usuarios/:id`    | Exclui usuário                 |

* **Itens (`/itens`):**

| Método | Rota               | Descrição                                          |
| :----- | :----------------- | :------------------------------------------------- |
| POST   | `/itens`           | Cadastra um novo item                 |
| GET    | `/itens`           | Lista todos os itens disponíveis (com filtros e busca) |
| GET    | `/itens/:id`       | Detalhes de um item específico                     |
| PUT    | `/itens/:id`       | Atualiza um item existente                         |
| DELETE | `/itens/:id`       | Exclui um item                                     |

* **Propostas (`/propostas`):**

| Método | Rota                     | Descrição                                                  |
| :----- | :----------------------- | :--------------------------------------------------------- |
| POST   | `/propostas`             | Cria uma nova proposta de troca         |
| GET    | `/propostas`             | Lista todas as propostas (com filtros por status, proponente, item desejado) |
| GET    | `/propostas/:id`         | Detalhes de uma proposta específica                        |
| PUT    | `/propostas/:id/aceitar` | Aceita uma proposta de troca            |
| PUT    | `/propostas/:id/recusar` | Recusa uma proposta de troca            |

* **Uploads (`/uploads`):**

| Método | Rota               | Descrição                                                      |
| :----- | :----------------- | :------------------------------------------------------------- |
| POST   | `/uploads/upload`  | Realiza o upload de uma imagem para o Cloudinary e retorna sua URL. |

**Observação sobre o Upload:**
Para associar uma imagem a um item, primeiro faça o `POST` para `/uploads/upload`. Em seguida, utilize a `imageUrl` retornada por este endpoint no campo `foto` ao criar ou atualizar um item via `POST /itens` ou `PUT /itens/:id`.

### **6. Contribuições da Equipe**

