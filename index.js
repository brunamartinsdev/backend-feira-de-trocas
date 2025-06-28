import express from "express";
import usuarioRoutes from "./src/routes/usuarioRoutes.js"; 
import loginRoutes from "./src/routes/loginRoutes.js";

const app = express();
app.use(express.json());

app.use("/usuarios", usuarioRoutes);
app.use("/login", loginRoutes);

const PORT = 8084; 
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});