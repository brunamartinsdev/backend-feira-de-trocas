import express from "express";
import loginRoutes from "./routes/loginRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js"; 
import itemRoutes from "./routes/itemRoutes.js";
import propostaRoutes from "./routes/propostaRoutes.js"
import protectedRoutes from './routes/protectedRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import propostaRoutes from "./routes/propostaRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
app.use(express.json());

app.use('/login', loginRoutes);
app.use('/', protectedRoutes);
app.use('/', adminRoutes);

app.use('/usuarios', usuarioRoutes);
app.use('/itens', itemRoutes);
app.use('/propostas', propostaRoutes);
app.use('/uploads', uploadRoutes);

const PORT = 8084; 
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});