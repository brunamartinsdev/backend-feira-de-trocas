import prisma from "../models/prismaClient.js";

const getNotificacoes = async (request, response) => {
    const userId = request.user.id;
    try {
        const notificacoes = await prisma.notificacao.findMany({
            where: { destinatarioId: userId },
            orderBy: { createdAt: 'desc' }
        });
        return response.status(200).json(notificacoes);
    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        return response.status(500).json({ error: "Erro interno." });
    }
};

const marcarComoLidas = async (request, response) => {
    const userId = request.user.id;
    try {
        await prisma.notificacao.updateMany({
            where: {
                destinatarioId: userId,
                lida: false
            },
            data: { lida: true }
        });
        return response.status(204).send();
    } catch (error) {
        console.error("Erro ao marcar notificações como lidas:", error);
        return response.status(500).json({ error: "Erro interno." });
    }
};

export default { getNotificacoes, marcarComoLidas };