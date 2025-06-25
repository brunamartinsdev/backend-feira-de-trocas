import express from "express"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({log:["query","error"]});
const app = express();
app.use(express.json());

app.listen(8084, ()=>{
    console.log("Running on port 8084")
})

app.get("/usuarios", async (request, response)=>{
        const usuarios = await prisma.cadastro.findMany();
        return response.json(usuarios).status(200);
})
app.post("/usuarios", async (request,response) => {
    const {nome, email} = request.body;
    const usuario = await prisma.cadastro.create({
        data:{
            nome, email
        }
    })

    return response.status(201).json(usuario);
})

app.put("/usuarios/:id", async (request, response)=>{
    console.log("BODY:", request.body);
    const {nome, email} = request.body;
    const {id} = request.params;
    
    const user = await prisma.cadastro.findUnique({
        where: {id}
    })

    if (!user){
        return response.status(404).json("Usuário não encontrado!");
    }
    const usuario = await prisma.cadastro.update({
        where: {id},
        data :{nome, email }
    })
    
    return response.status(200).json(usuario);
})

app.delete("/usuarios/:id", async (request, response)=>{
    const {id} = request.params;
    const user = await prisma.cadastro.findUnique({
        where: {id: String(id)}
    })

    if (!user){
        return response.status(404).json("Usuário não encontrado!");
    }

    await prisma.cadastro.delete({
        where: { id: String(id)}
    });
    return response.status(204).send();
})
