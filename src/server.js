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

const allowedOrigins = [
  'https://frontend-feira-de-trocas.vercel.app', // O seu site em produção
  'http://localhost:5173'                         // O seu site de desenvolvimento local
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (como apps mobile ou Postman) ou se a origem estiver na lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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


const PORT = 8084;
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});
