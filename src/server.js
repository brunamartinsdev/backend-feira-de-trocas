import express from "express";
import loginRoutes from "./routes/loginRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import propostaRoutes from "./routes/propostaRoutes.js";
import protectedRoutes from './routes/protectedRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from "./routes/uploadRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import notificacaoRoutes from "./routes/notificacaoRoutes.js"
import cors from "cors";

const app = express();  
app.use(express.json());
app.use(cors());

app.use('/login', loginRoutes); 

//tudo que vem depois de protectedRoutes exigirá um JWT válido
app.use('/', protectedRoutes);

//rotas de usuários comuns (protegidas pelo JWT, mas sem exigências de admin)
app.use('/usuarios', usuarioRoutes);
app.use('/itens', itemRoutes);
app.use('/propostas', propostaRoutes);
app.use('/uploads', uploadRoutes);
app.use('/categorias', categoriaRoutes);

app.use('/propostas', propostaRoutes);
app.use('/notificacoes', notificacaoRoutes);    

//rota de administração (protegida pelo JWT e exigem privilégios de admin)
app.use('/admin', adminRoutes);


const PORT = 8084;
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});