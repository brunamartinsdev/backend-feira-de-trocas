import prisma from "../models/prismaClient.js";

const getCategorias = async (request, response) => {
    const { includeUnavailable, busca } = request.query;

    try {
        const queryOptions = {

            select: {
                categoria: true
            },
            where: {}
        };

        if (includeUnavailable !== 'true') {
            queryOptions.where.status = "Disponível";
        }

        if (busca) {

            queryOptions.where.categoria = {
                contains: String(busca),
                mode: "insensitive"
            };
        }

        const categoriasDoBanco = await prisma.item.findMany(queryOptions);

        const categoriasUnicasNormalizadas = new Set();
        categoriasDoBanco.forEach(item => {

            categoriasUnicasNormalizadas.add(item.categoria.toLowerCase());
        });

        const categoryNames = ['TODOS', ...Array.from(categoriasUnicasNormalizadas).map(cat => {
            return cat.charAt(0).toUpperCase() + cat.slice(1);
        })];

        categoryNames.sort((a, b) => {
            if (a === 'TODOS') return -1;
            if (b === 'TODOS') return 1;
            return a.localeCompare(b);
        });


        return response.status(200).json(categoryNames);
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        return response.status(500).json({ error: "Erro interno ao buscar categorias." });
    }
};

const categoriaController = {
    getCategorias,
};

export default categoriaController;