import prisma from '../models/prismaClient.js';

const getCategorias = async (request, response) => {
    try {
        const categorias = await prisma.item.findMany({
            distinct: ['categoria'],
            select: {
                categoria: true
            },
            where: {
                status: "Disponível"
            }
        });

        const categoriasNomes = ['TODOS', ...categorias.map(c => c.categoria)];

        return response.status(200).json(categoriasNomes);
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        return response.status(500).json({ error: "Erro interno ao buscar categorias." });
    }
};

const categoriaController = {
    getCategorias,
};

export default categoriaController;