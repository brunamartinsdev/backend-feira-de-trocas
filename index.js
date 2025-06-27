import express from "express";
import usuarioRoutes from "./src/routes/usuarioRoutes.js"; 

const app = express();
app.use(express.json());


app.use("/usuarios", usuarioRoutes);

const PORT = 8084; 
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});