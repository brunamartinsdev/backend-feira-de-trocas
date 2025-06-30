import prisma from "../models/prismaClient.js";
import bcrypt from "bcryptjs"

const getUsuarios = async (request, response) => {
    try {
        const usuarios = await prisma.usuario.findMany();
        return response.status(200).json(usuarios);
    } catch (error) {
        console.error("Erro ao buscar usuários: ", error);
        return response.status(500).json({ error: "Erro interno ao buscar usuários." });
    }
};

const getUsuarioById = async (request, response) => {
    const { id } = request.params;
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id }
        });

        if (!usuario) {
            return response.status(404).json({ error: "Usuário não encontrado." });
        }

        return response.status(200).json(usuario);
    } catch (error) {
        console.error("Erro ao buscar usuário por Id: ", error);
        return response.status(500).json({ error: "Erro interno ao buscar usuário por Id." });
    }
};

const createUsuario = async (request, response) => {
    const { nome, email, senha, isAdmin } = request.body;
    const passHash = bcrypt.hashSync(senha,10);

    
    try {
        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: passHash, isAdmin
            }
        });
        return response.status(201).json(usuario);
    } catch (error) {
        console.error("Erro ao criar usuário: ", error);

        if (error.code === 'P2002') { // código P2002 no Prisma representa violação do campo unique
            return response.status(409).json({ error: "E-mail já cadastrado." });
        }

        return response.status(500).json({ error: "Erro interno ao criar usuário." });
    }
};

const updateUsuario = async (request, response) => {
    const { id } = request.params;
    const { nome, email, senha } = request.body;
    try {
        const userExists = await prisma.usuario.findUnique({
            where: { id }
        });

        if (!userExists) {
            return response.status(404).json({ error: "Usuário não encontrado para atualização." });
        }

        const usuarioAtualizado = await prisma.usuario.update({
            where: { id },
            data: { nome, email, senha }
        });

        return response.status(200).json(usuarioAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);

        if (error.code === 'P2025') { // código para registro não encontrado no Prisma
            return response.status(404).json({ error: "Usuário não encontrado para atualização." });
        }
        if (error.code === 'P2002') {
            return response.status(409).json({ error: "E-mail já cadastrado por outro usuário." });
        }
        return response.status(500).json({ error: "Erro interno ao atualizar usuário." });
    }
};

const deleteUsuario = async (request, response) => {
    const { id } = request.params;
    try {

        const usuario = await prisma.usuario.findUnique({
            where: { id }
        });

        if (!usuario) {
            return response.status(404).json({ error: "Usuário não encontrado para exclusão." });
        }

        await prisma.usuario.delete({
            where: { id }
        });

        return response.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar usuário: ", error);

        // tratamento para violação de chave estrangeira (P2003)
        if (error.code === 'P2003') { // código para Foreign Key Constraint Failed
            return response.status(409).json({
                error: "Não foi possível deletar o usuário. Ele possui itens cadastrados ou propostas associadas.",
                details: "Remova todos os itens e propostas deste usuário antes de tentar excluí-lo."
            });
        }

        if (error.code === 'P2025') {
            return response.status(404).json({ error: "Usuário não encontrado para exclusão." });
        }

        return response.status(500).json({ error: "Erro interno do servidor ao deletar usuário." });
    }
};

const usuariosController = {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario
};

export default usuariosController