# Feira de Trocas Comunitária - Backend

### **1. Visão Geral**

[Acesse o site](https://frontend-feira-de-trocas.vercel.app/)
API backend para a "Feira de Trocas Comunitária", um projeto prático do Bootcamp FullStack da Avanti. O sistema visa facilitar a troca de itens entre usuários, promovendo o consumo consciente e os laços comunitários através de um sistema de propostas e notificações.

### **2. Tecnologias**

* **Node.js** e **Express.js**: Para a construção da API RESTful.
* **Prisma ORM**: Para a interação com o banco de dados de forma segura e moderna.
* **PostgreSQL**: Banco de dados relacional robusto.
* **Cloudinary**: Serviço de gerenciamento de mídia na nuvem para upload e hospedagem de imagens.
* **Multer**: Middleware para Node.js que lida com o upload de arquivos (`multipart/form-data`).
* **Bcryptjs**: Biblioteca para hash de senhas de forma segura.
* **JSON Web Token (JWT)**: Para autenticação de usuários e proteção de rotas.

### **3. Modelagem de Dados**

O banco de dados é composto pelas seguintes entidades principais:

* **Usuario**: Gerencia as informações dos usuários. Inclui campos como `nome`, `email`, `senha` (hasheada), e `isAdmin`.
* **Item**: Representa os objetos disponibilizados para troca. Contém `nome`, `descricao`, `categoria`, `status` (`Disponível`, `Trocado`), `URL da foto`, e a relação com seu `usuarioResponsavel`.
* **Proposta**: Gerencia as solicitações de troca. Possui `status` (`pendente`, `aceita`, `recusada`, `cancelada`), e as relações com os itens e os usuários envolvidos (`itemOfertado`, `itemDesejado`, `quemFez`, `quemRecebeu`).
* **Notificacao**: Armazena as notificações para os usuários. Contém `mensagem`, `link` para a ação, um status de `lida`, e a relação com o `destinatario`.

### **4. Como Rodar o Backend**

**Pré-requisitos:** Node.js, npm, e uma instância do PostgreSQL rodando.

1.  **Clonar o Repositório:**
    ```bash
    git clone https://github.com/souzagabs/back_time7.git
    cd back_time7
    ```

2.  **Instalar Dependências:**
    ```bash
    npm install
    ```

3.  **Configurar o Arquivo `.env`:**
    Crie um arquivo `.env` na raiz do projeto e preencha-o com suas credenciais, seguindo o exemplo do arquivo `.env.example`.
    ```env
    DATABASE_URL="postgresql://<USUARIO>:<SENHA>@localhost:5432/<NOME_DB>"
    CLOUDINARY_CLOUD_NAME="seu_cloud_name_aqui"
    CLOUDINARY_API_KEY="sua_api_key_aqui"
    CLOUDINARY_API_SECRET="sua_api_secret_aqui"
    SECRET_KEY="sua_chave_secreta_para_jwt_aqui_bem_longa_e_aleatoria"
    ```

4.  **Aplicar as Migrações do Banco de Dados:**
    Este comando irá criar ou atualizar as tabelas no seu banco de dados para que correspondam ao schema do Prisma.
    ```bash
    npx prisma migrate dev
    ```
    *Se for a primeira vez ou se quiser limpar o banco de dados, pode usar `npx prisma migrate reset`.*

5.  **Gerar o Prisma Client:**
    ```bash
    npx prisma generate
    ```

6.  **Iniciar o Servidor:**
    ```bash
    npm run dev
    ```
    O servidor estará rodando em `http://localhost:8084`.

### **5. Endpoints da API**

Todas as rotas protegidas requerem um token JWT no cabeçalho `Authorization: Bearer <token>`.

* **Autenticação (`/login`)**

| Método | Rota     | Descrição                                |
| :----- | :------- | :--------------------------------------- |
| `POST` | `/login` | Realiza o login e retorna um JWT válido. |

* **Usuários (`/usuarios`)**

| Método   | Rota            | Descrição                                                                      | **Proteção** |
| :------- | :-------------- | :------------------------------------------------------------------------------- | :--------------------- |
| `POST`   | `/usuarios`     | Cria um novo usuário (registro).                                                 | Pública                |
| `GET`    | `/usuarios`     | Lista todos os usuários (sem a senha).                                           | Pública                |
| `GET`    | `/usuarios/:id` | Detalhes de um usuário, incluindo a contagem de trocas (`tradesCount`).          | Pública                |
| `PUT`    | `/usuarios/:id` | Atualiza um usuário (requer ser o próprio usuário ou admin).                     | Protegida / Autorizada |
| `DELETE` | `/usuarios/:id` | Apaga um usuário (requer ser o próprio usuário ou admin).                        | Protegida / Autorizada |

* **Itens (`/itens`)**

| Método   | Rota                   | Descrição                                                                                             | **Proteção** |
| :------- | :--------------------- | :------------------------------------------------------------------------------------------------------ | :--------------------- |
| `POST`   | `/itens`               | Cadastra um novo item. A imagem deve ser enviada como `multipart/form-data` no campo `fotoArquivo`.      | Protegida              |
| `GET`    | `/itens`               | Lista todos os itens, por padrão com status "Disponível". Aceita filtros (`busca`, `categoria`).        | Pública                |
| `GET`    | `/itens/:id`           | Detalhes de um item específico.                                                                         | Pública                |
| `GET`    | `/itens/usuario/itens` | Lista os itens do usuário autenticado. Aceita filtro de `status`.                                       | Protegida              |
| `PUT`    | `/itens/:id`           | Atualiza um item (requer ser o dono ou admin). Pode incluir uma nova imagem em `fotoArquivo`.           | Protegida / Autorizada |
| `DELETE` | `/itens/:id`           | Apaga um item (requer ser o dono ou admin).                                                             | Protegida / Autorizada |

* **Propostas (`/propostas`)**

| Método   | Rota                     | Descrição                                                                                             | **Proteção** |
| :------- | :----------------------- | :------------------------------------------------------------------------------------------------------ | :--------------------- |
| `POST`   | `/propostas`             | Cria uma nova proposta e envia uma notificação ao dono do item desejado.                                | Protegida              |
| `GET`    | `/propostas/feitas`      | Lista as propostas feitas pelo usuário autenticado.                                                     | Protegida              |
| `GET`    | `/propostas/recebidas`   | Lista as propostas recebidas pelo usuário autenticado.                                                  | Protegida              |
| `PUT`    | `/propostas/:id/aceitar` | Aceita uma proposta, atualiza o status e a propriedade dos itens, e envia notificações.                 | Protegida / Autorizada |
| `PUT`    | `/propostas/:id/recusar` | Recusa uma proposta e envia uma notificação ao proponente.                                              | Protegida / Autorizada |
| `DELETE` | `/propostas/:id`         | Cancela uma proposta `pendente` (requer ser o proponente).                                              | Protegida / Autorizada |

* **Notificações (`/notificacoes`)**

| Método | Rota                            | Descrição                                                  | **Proteção** |
| :----- | :------------------------------ | :--------------------------------------------------------- | :----------- |
| `GET`  | `/notificacoes`                 | Lista as notificações do usuário autenticado.            | Protegida    |
| `PUT`  | `/notificacoes/marcar-como-lidas` | Marca todas as notificações não lidas como `lida: true`. | Protegida    |

### **6. Coleção do Insomnia para Testes**

Para facilitar os testes manuais dos endpoints da API, a coleção do Insomnia está disponível neste repositório.

**Como Importar:**

1.  Faça o download do arquivo `feira-de-trocas-collection.json` localizado em `docs/insomnia/`.
2.  No Insomnia, vá em `File > Import From File` e selecione o arquivo baixado.
3.  Escolha "Import as a new Collection".

### **7. Contribuições da Equipe**

* **Anderson Oliveira de Sousa:** desenvolveu os schemas que seriam usados no código, atuou também nas etapas de teste da api e revisão final do código.
* **Bruna Martins Combat:** Realizou o desenvolvimento e a implementação dos módulos do backend (Usuário, Item e Proposta), incluindo todas as operações CRUD, lógicas de negócio como busca, filtros e o fluxo de propostas. Organizou a estrutura das pastas do backend com a arquitetura MVC. Integrou a segurança, implementando o hash de senhas e os controles de acesso por autorização nas rotas de Usuário, Item e Proposta. Desenvolveu a funcionalidade de upload de imagens com Cloudinary e Multer, incluindo a lógica de exclusão. Contribuiu ativamente na resolução de erros, na depuração do backend e na realização de testes manuais. Também participou ativamente nas reuniões e discussões sobre o projeto, além de dar suporte aos colegas do grupo.
* **Davi José Lima de Sousa:** atuou nas etapas de teste da API, colaborou com sugestões de melhoria e participou das discussões técnicas da equipe.
* **Daiane Rocha:** contribuiu com os testes da aplicação, participou das discussões de equipe e deu suporte no alinhamento das tarefas.
* **Gabriel de Souza Brasil:** responsável pela estruturação inicial do projeto, lógica principal da aplicação e organização do repositório backend. Desenvolveu os controllers de login, implementou o sistema completo de autenticação e autorização com JWT, incluindo hash de senhas com bcrypt, rotas autenticadas e áreas com acesso restrito via validação de permissões (isAdmin). Também configurou o uso de variáveis de ambiente com `.env` para gerenciamento da `SECRET_KEY`, além de contribuir com ajustes finais e suporte à equipe durante o desenvolvimento.
