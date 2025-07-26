import express from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import loginRoutes from "./routes/loginRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import propostaRoutes from "./routes/propostaRoutes.js";
import protectedRoutes from './routes/protectedRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from "./routes/uploadRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import notificacaoRoutes from "./routes/notificacaoRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'https://frontend-feira-de-trocas.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use('/login', loginRoutes);
app.use('/', protectedRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/itens', itemRoutes);
app.use('/propostas', propostaRoutes);
app.use('/uploads', uploadRoutes);
app.use('/categorias', categoriaRoutes);
app.use('/notificacoes', notificacaoRoutes);
app.use('/admin', adminRoutes);

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});


const PORT = 8084;
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});
