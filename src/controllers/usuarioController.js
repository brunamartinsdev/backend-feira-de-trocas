import prisma from "../models/prismaClient.js";
import bcrypt from 'bcryptjs'; 

const getUsuarios = async (request, response) => {
    try {
        const usuarios = await prisma.usuario.findMany();
        const usuariosSemSenha = usuarios.map(usuario => {
            const { senha: _, ...rest } = usuario;
            return rest;
        });
        return response.status(200).json(usuariosSemSenha);
    } catch (error) {
        console.error("Erro ao buscar usuários: ", error);
        return response.status(500).json({ error: "Erro interno ao buscar usuários." });
    }
};

const getUsuarioById = async (request, response) => {
    const { id } = request.params;
    const userIdFromToken = request.user ? request.user.id : null;
    const isAdmin = request.user ? request.user.isAdmin : false;

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id }
        });

        if (!usuario) {
            return response.status(404).json({ error: "Usuário não encontrado." });
        }

        const { senha: _, ...usuarioSemSenha } = usuario;
        return response.status(200).json(usuarioSemSenha);
    } catch (error) {
        console.error("Erro ao buscar usuário por Id: ", error);
        return response.status(500).json({ error: "Erro interno ao buscar usuário por Id." });
    }
};

const createUsuario = async (request, response) => {
    const { nome, email, senha } = request.body; 

    try {

        const hashedPassword = await bcrypt.hash(senha, 10);

        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: hashedPassword,
            }
        });

        const { senha: _, ...usuarioSemSenha } = usuario;
        return response.status(201).json(usuarioSemSenha); 
    } catch (error) {
        console.error("Erro ao criar usuário: ", error);
        if (error.code === 'P2002') { //erro de e-mail duplicado
            return response.status(409).json({ error: "E-mail já cadastrado." });
        }
        return response.status(500).json({ error: "Erro interno ao criar usuário." });
    }
};

const updateUsuario = async (request, response) => {
    const { id } = request.params;
    const { nome, email, senha } = request.body; 

    const userIdFromToken = request.user.id;
    const isUserAdmin = request.user.isAdmin; 

    try {
        const userExists = await prisma.usuario.findUnique({
            where: { id }
        });

        if (!userExists) {
            return response.status(404).json({ error: "Usuário não encontrado para atualização." });
        }

        if (id !== userIdFromToken && !isUserAdmin) {
            return response.status(403).json({ error: "Você não tem permissão para atualizar este usuário." });
        }

        let dataToUpdate = { nome, email }; 
        if (senha) {
            dataToUpdate.senha = await bcrypt.hash(senha, 10); 
        }

        const usuarioAtualizado = await prisma.usuario.update({
            where: { id },
            data: dataToUpdate 
        });

        const { senha: _, ...usuarioSemSenha } = usuarioAtualizado;
        return response.status(200).json(usuarioSemSenha);
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        if (error.code === 'P2025') {
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
    const userIdFromToken = request.user.id; 
    const isUserAdmin = request.user.isAdmin; 

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id }
        });

        if (!usuario) {
            return response.status(404).json({ error: "Usuário não encontrado para exclusão." });
        }

        if (id !== userIdFromToken && !isUserAdmin) {
            return response.status(403).json({ error: "Você não tem permissão para excluir este usuário." });
        }

        await prisma.usuario.delete({
            where: { id }
        });

        return response.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar usuário: ", error);
        if (error.code === 'P2003') { // Foreign Key Constraint Failed
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

export default usuariosController;