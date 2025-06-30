import express from "express";
import loginRoutes from "./routes/loginRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js"; 
import itemRoutes from "./routes/itemRoutes.js";
import protectedRoutes from './routes/protectedRoutes.js';

const app = express();
app.use(express.json());

app.use('/login', loginRoutes);
app.use('/', protectedRoutes);

app.use('/usuarios', usuarioRoutes);
app.use('/itens', itemRoutes);

const PORT = 8084; 
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});