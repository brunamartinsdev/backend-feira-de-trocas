import prisma from "../models/prismaClient.js";

const createProposta = async (request, response) => {
    const { itemOfertadoId, itemDesejadoId } = request.body;
    const quemFezId = request.user.id; //para pegar o id do usuário autenticado
    const isAdmin = request.user.isAdmin; //se o usuário autenticado é admin
    try {
        const [itemOfertado, itemDesejado] = await prisma.$transaction([ //prisma.$transaction permite fazer várias operações no banco de dados
            prisma.item.findUnique({ where: { id: itemOfertadoId } }), //procura o item que o usuário está oferecendo
            prisma.item.findUnique({ where: { id: itemDesejadoId } }), //procura o item que o usuário quer receber
        ]);

        if (!itemOfertado || !itemDesejado) {
            return response.status(404).json({ error: "Item(ns) ou usuário não encontrado." });
        }

        if (itemOfertado.usuarioResponsavelId !== quemFezId && !isAdmin) {
            return response.status(403).json({ error: "O item ofertado não pertence ao seu usuário ou você não tem permissão para usá-lo." });
        }

        if (itemDesejado.usuarioResponsavelId === quemFezId) {
            return response.status(400).json({ error: "Não é possível propor troca por um item seu." });
        }

        if (itemOfertado.status !== "Disponível" || itemDesejado.status !== "Disponível") {
            return response.status(400).json({ error: "Um dos itens envolvidos não está disponível para troca." });
        }

        const proposta = await prisma.proposta.create({
            data: {
                itemOfertado: { connect: { id: itemOfertadoId } },
                itemDesejado: { connect: { id: itemDesejadoId } },
                quemFez: { connect: { id: quemFezId } },
                status: "pendente"
            }
        });
        return response.status(201).json(proposta);
    } catch (error) {
        console.error("Erro ao criar proposta:", error);
        return response.status(500).json({ error: "Erro interno ao criar proposta." });
    }
};


const aceitarProposta = async (request, response) => {
    const { id } = request.params;
    const userIdFromToken = request.user.id;
    const isAdmin = request.user.isAdmin;

    try {
        const proposta = await prisma.proposta.findUnique({
            where: { id },
            include: {
                itemDesejado: {
                    select: {
                        usuarioResponsavelId: true 
                    }
                },
                quemFez: {
                    select: {
                        id: true 
                    }
                }
            }
        });

        if (!proposta) {
            return response.status(404).json({ error: "Proposta não encontrada." });
        }

        if (proposta.status === 'aceita' || proposta.status === 'recusada') {
            return response.status(400).json({ error: "Esta proposta já foi aceita ou recusada." });
        }

        if (!isAdmin && proposta.itemDesejado.usuarioResponsavelId !== userIdFromToken) {
            return response.status(403).json({ error: "Você não tem permissão para aceitar/recusar esta proposta. Apenas o dono do item desejado pode fazê-lo." });
        }

        const propostaAceita = await prisma.proposta.update({
            where: { id },
            data: { status: 'aceita' }
        });

        return response.status(200).json({
            message: "Proposta aceita com sucesso!",
            proposta: propostaAceita
        });

    } catch (error) {
        console.error("Erro ao aceitar proposta:", error);
        return response.status(500).json({ error: "Erro interno ao aceitar proposta." });
    }
};

const recusarProposta = async (request, response) => {
    const { id } = request.params;
    const userIdFromToken = request.user.id;
    const isAdmin = request.user.isAdmin;

    try {
        const proposta = await prisma.proposta.findUnique({
            where: { id },
            include: {
                itemDesejado: {
                    select: {
                        usuarioResponsavelId: true 
                    }
                },
                quemFez: {
                    select: {
                        id: true 
                    }
                }
            }
        });

        if (!proposta) {
            return response.status(404).json({ error: "Proposta não encontrada." });
        }

        if (proposta.status === 'aceita' || proposta.status === 'recusada') {
            return response.status(400).json({ error: "Esta proposta já foi aceita ou recusada." });
        }

        if (!isAdmin && proposta.itemDesejado.usuarioResponsavelId !== userIdFromToken) {
            return response.status(403).json({ error: "Você não tem permissão para aceitar/recusar esta proposta. Apenas o dono do item desejado pode fazê-lo." });
        }

        const propostaRecusada = await prisma.proposta.update({
            where: { id },
            data: { status: 'recusada' }
        });


        return response.status(200).json({
            message: "Proposta recusada com sucesso!",
            proposta: propostaRecusada
        });

    } catch (error) {
        console.error("Erro ao recusar proposta:", error);
        return response.status(500).json({ error: "Erro interno ao recusar proposta." });
    }
};


const getPropostas = async (request, response) => {
    const { status, quemFezId, itemDesejadoId } = request.query;
    const userIdFromToken = request.user ? request.user.id : null;
    const isAdmin = request.user ? request.user.isAdmin : false;

    const where = {}; 
    if (status) { 
        where.status = String(status);
    }

    if (quemFezId) { 
        if (quemFezId !== userIdFromToken && !isAdmin) {
             return response.status(403).json({ error: "Você não tem permissão para ver propostas de outros usuários." });
        }
        where.quemFezId = String(quemFezId);
    } else if (!isAdmin && userIdFromToken) {

        const userOwnedItems = await prisma.item.findMany({
            where: { usuarioResponsavelId: userIdFromToken },
            select: { id: true } 
        });
        const userOwnedItemIds = userOwnedItems.map(item => item.id); 

        const relevantProposalsConditions = [];

        relevantProposalsConditions.push({ quemFezId: userIdFromToken });

        if (userOwnedItemIds.length > 0) {
            relevantProposalsConditions.push({ itemDesejadoId: { in: userOwnedItemIds } });
        }

        if (relevantProposalsConditions.length > 0) {
            where.OR = relevantProposalsConditions;
        } else {
            return response.status(200).json([]);
        }
    }

    if (itemDesejadoId && !where.itemDesejadoId) {
        const itemDesejado = await prisma.item.findUnique({ where: { id: itemDesejadoId } });

        if (!itemDesejado) {
            return response.status(404).json({ error: "Item desejado não encontrado." });
        }

        if (itemDesejado.usuarioResponsavelId !== userIdFromToken && !isAdmin) {
            return response.status(403).json({ error: "Você não tem permissão para ver propostas para este item." });
        }
        where.itemDesejadoId = String(itemDesejadoId);
    }

    try {
        const propostas = await prisma.proposta.findMany({
            where,
            include: {
                itemOfertado: { select: { id: true, nome: true, categoria: true, usuarioResponsavelId: true } },
                itemDesejado: { select: { id: true, nome: true, categoria: true, usuarioResponsavelId: true } },
                quemFez: { select: { id: true, nome: true, email: true } }
            }
        });
        return response.status(200).json(propostas);
    } catch (error) {
        console.error("Erro ao listar propostas:", error);
        return response.status(500).json({ error: "Erro interno ao listar propostas." });
    }
};

const getPropostaById = async (request, response) => {
    const { id } = request.params;
    const userIdFromToken = request.user ? request.user.id : null;
    const isAdmin = request.user ? request.user.isAdmin : false;

    try {
        const proposta = await prisma.proposta.findUnique({
            where: { id },
            include: {
                itemOfertado: true,
                itemDesejado: true,
                quemFez: true
            }
        });
        if (!proposta) {
            return response.status(404).json({ error: "Proposta não encontrada." });
        }

        const ehProponente = proposta.quemFezId === userIdFromToken;
        const ehDono = proposta.itemDesejado.usuarioResponsavelId === userIdFromToken;

        if (!ehProponente && !ehDono && !isAdmin) {
            return response.status(403).json({ error: "Você não tem permissão para visualizar esta proposta." });
        }

        return response.status(200).json(proposta);
    } catch (error) {
        console.error("Erro ao buscar proposta:", error);
        return response.status(500).json({ error: "Erro interno ao buscar proposta." });
    }
};

const deleteProposta = async (request, response) => {
    const { id } = request.params; 
    const userIdFromToken = request.user.id; 
    const isAdmin = request.user.isAdmin;   

    try {
        const proposta = await prisma.proposta.findUnique({
            where: { id },
            include: {
                itemOfertado: { select: { usuarioResponsavelId: true } }, 
                itemDesejado: { select: { usuarioResponsavelId: true } }, 
                quemFez: { select: { id: true } }
            }
        });

        if (!proposta) {
            return response.status(404).json({ error: "Proposta não encontrada." });
        }

        const isProponente = proposta.quemFez.id === userIdFromToken;
        const isDesiredItemOwner = proposta.itemDesejado.usuarioResponsavelId === userIdFromToken;

        if (!isProponente && !isDesiredItemOwner && !isAdmin) {
            return response.status(403).json({ error: "Você não tem permissão para excluir esta proposta." });
        }

        await prisma.proposta.delete({
            where: { id }
        });

        return response.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar proposta:", error);
        if (error.code === 'P2025') {
            return response.status(404).json({ error: "Proposta não encontrada para exclusão." });
        }
        return response.status(500).json({ error: "Erro interno ao deletar proposta." });
    }
};


const propostasController = {
    createProposta,
    aceitarProposta,
    recusarProposta,
    getPropostas,
    getPropostaById,
    deleteProposta
};

export default propostasController;