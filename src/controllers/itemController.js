import prisma from "../models/prismaClient.js";

const getItens = async (request, response) => {
    const { categoria, busca } = request.query;
    const where = {};

    if (categoria) {
        where.categoria = String(categoria); //para filtrar por categoria
    }

    if (busca) { //para buscar por palavra-chave com nome ou descrição
        where.OR = [
            { nome: { contains: String(busca), mode: "insensitive" } }, //insensitive para ignorar maiúsculas e minúsculas
            { descricao: { contains: String(busca), mode: "insensitive" } },
        ];
    }

    try {
        const itens = await prisma.item.findMany({
            where,
            include: { //para incluir os dados do dono do produto além do produto
                usuarioResponsavel: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            }
        });
        return response.status(200).json(itens);
    } catch (error) {
        console.error("Erro ao buscar itens: ", error);
        return response.status(500).json({ error: "Erro interno ao buscar itens." });
    }
};

const getItemById = async (request, response) => {
    const { id } = request.params;
    try {
        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                usuarioResponsavel: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            }
        });

        if (!item) {
            return response.status(404).json({ error: "Item não encontrado." });
        }
        return response.status(200).json(item);
    } catch (error) {
        console.error("Erro ao buscar item por Id: ", error);
        return response.status(500).json({ error: "Erro interno ao buscar o item." });
    }
};

const createItem = async (request, response) => {
    const { nome, descricao, categoria, usuarioResponsavelId, foto } = request.body;
    try {
        const usuarioExiste = await prisma.usuario.findUnique({
            where: { id: usuarioResponsavelId }
        });

        if (!usuarioExiste) {
            return response.status(404).json({ error: "Usuário responsável não encontrado." });
        }

        const item = await prisma.item.create({
            data: {
                nome,
                descricao,
                categoria,
                status: "Disponível",
                foto,
                usuarioResponsavel: { connect: { id: usuarioResponsavelId } } //para conectar o item ao usuário
            }
        });
        return response.status(201).json(item);
    } catch (error) {
        console.error("Erro ao cadastrar item: ", error);
        return response.status(500).json({ error: "Erro interno ao cdastrar item." });
    }
};

const updateItem = async (request, response) => {
    const { id } = request.params;
    const { nome, descricao, categoria, status, foto } = request.body;

    try {
        const itemExiste = await prisma.item.findUnique({
            where: { id }
        });

        if (!itemExiste) {
            return response.status(404).json({ error: "Item não encontrado." });
        };

        const itemAtualizado = await prisma.item.update({
            where: { id },
            data: { nome, descricao, categoria, status, foto }
        });
        return response.status(200).json(itemAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar item: ", error);
        if (error.code === 'P2025') { // código para registro não encontrado no Prisma
            return response.status(404).json({ error: "Item não encontrado" });
        }

        return response.status(500).json({ error: "Erro interno ao atualizar item" });
    }
};

const deleteItem = async (request, response) => {
    const { id } = request.params;

    try {
        const itemExiste = await prisma.item.findUnique({
            where: { id }
        });

        if (!itemExiste) {
            return response.status(404).json({ error: "Item não encontrado." });
        };

        await prisma.item.delete({
            where: { id }
        });
        return response.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar item: ", error);
        if (error.code === 'P2003') {
            return response.status(409).json({
                error: "Não foi possível deletar o item. Ele pode estar envolvido em propostas de troca.",
                details: "Remova as propostas associadas a este item antes de tentar excluí-lo."
            });
        }
        if (error.code === 'P2025') {
            return response.status(404).json({ error: "Item não encontrado." });
        }

        return response.status(500).json({ error: "Erro interno ao deletar item." });
    }
};

const itensController = {
    getItens,
    getItemById,
    createItem,
    updateItem,
    deleteItem
};

export default itensController;