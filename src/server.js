import express from "express";
import usuarioRoutes from "./routes/usuarioRoutes.js"; 
import itemRoutes from "./routes/itemRoutes.js"

const app = express();
app.use(express.json());


app.use('/usuarios', usuarioRoutes);
app.use('/itens', itemRoutes);

const PORT = 8084; 
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});