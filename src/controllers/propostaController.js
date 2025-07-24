import prisma from "../models/prismaClient.js";

const createProposta = async (request, response) => {
    const { itemOfertadoId, itemDesejadoId, mensagem } = request.body;
    const quemFezId = request.user.id;
    const isAdmin = request.user.isAdmin;

    try {
        const [itemOfertado, itemDesejado] = await prisma.$transaction([
            prisma.item.findUnique({ where: { id: itemOfertadoId } }),
            prisma.item.findUnique({ where: { id: itemDesejadoId } }),
        ]);

        const quemRecebeuId = itemDesejado.usuarioResponsavelId;

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

        const responsavelItemDesejadoId = itemDesejado.usuarioResponsavelId;

        const propostaRepetida = await prisma.proposta.findFirst({
            where: {
                itemOfertadoId,
                itemDesejadoId,
                quemFezId,
            }
        });

        if (propostaRepetida) {
            return response.status(400).json({
                error: "Você já fez uma proposta para este item. Escolha outro item, ou ofereça um item diferente"
            });
        }

        const propostasMesmoUsuario = await prisma.proposta.findMany({
            where: {
                itemOfertadoId,
                quemFezId,
                itemDesejado: {
                    usuarioResponsavelId: responsavelItemDesejadoId
                }
            }
        });

        if (propostasMesmoUsuario.length >= 2) {
            return response.status(400).json({
                error: "Você já utilizou esse item em duas propostas diferentes para este usuário. Escolha outro item."
            });
        }

        // Verifica se já fez mais de 5 propostas com este item HOJE
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const propostasHoje = await prisma.proposta.count({
            where: {
                itemOfertadoId,
                quemFezId,
                dataCriacao: {
                    gte: hoje,
                }
            }
        });

        if (propostasHoje >= 5) {
            return response.status(400).json({
                error: "Este item já foi usado em 5 propostas hoje. Tente novamente amanhã."
            });
        }

        const proposta = await prisma.proposta.create({
            data: {
                itemOfertado: { connect: { id: itemOfertadoId } },
                itemDesejado: { connect: { id: itemDesejadoId } },
                quemFez: { connect: { id: quemFezId } },
                quemRecebeu: { connect: { id: quemRecebeuId } },
                status: "pendente",
                mensagem: mensagem || undefined,
                responsabilidadeAceita: true,
                dataCriacao: new Date()
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

    try {
        const propostaOriginal = await prisma.proposta.findUnique({
            where: { id },
            include: {
                itemOfertado: { select: { id: true, usuarioResponsavelId: true } },
                itemDesejado: { select: { id: true, usuarioResponsavelId: true } },
            }
        });

        if (!propostaOriginal) {
            return response.status(404).json({ error: "Proposta não encontrada." });
        }

        if (propostaOriginal.itemDesejado.usuarioResponsavelId !== userIdFromToken) {
            return response.status(403).json({ error: "Não tem permissão para aceitar esta proposta." });
        }

        if (propostaOriginal.status !== 'pendente') {
            return response.status(400).json({ error: `Esta proposta já foi '${propostaOriginal.status}'.` });
        }

        const resultadoTransacao = await prisma.$transaction(async (tx) => {
            
            const propostaAceita = await tx.proposta.update({
                where: { id: propostaOriginal.id },
                data: { status: 'aceita', dataResposta: new Date() }
            });

            await tx.item.update({
                where: { id: propostaOriginal.itemOfertado.id },
                data: {
                    status: 'Trocado',
                    usuarioResponsavelId: propostaOriginal.itemDesejado.usuarioResponsavelId
                }
            });

            await tx.item.update({
                where: { id: propostaOriginal.itemDesejado.id },
                data: {
                    status: 'Trocado',
                    usuarioResponsavelId: propostaOriginal.itemOfertado.usuarioResponsavelId
                }
            });

            await tx.proposta.updateMany({
                where: {
                    status: 'pendente',
                    OR: [
                        { itemOfertadoId: propostaOriginal.itemOfertado.id },
                        { itemDesejadoId: propostaOriginal.itemOfertado.id },
                        { itemOfertadoId: propostaOriginal.itemDesejado.id },
                        { itemDesejadoId: propostaOriginal.itemDesejado.id },
                    ]
                },
                data: { status: 'cancelada' }
            });

            return propostaAceita;
        });

        return response.status(200).json({
            message: "Troca concluída com sucesso!",
            proposta: resultadoTransacao
        });

    } catch (error) {
        console.error("Erro ao aceitar proposta:", error);
        return response.status(500).json({ error: "Erro interno ao concluir a troca." });
    }
};

const getPropostasFeitas = async (req, res) => {
    const userId = req.user.id;
    try {
        const propostas = await prisma.proposta.findMany({
            where: { quemFezId: userId },
            include: {
                itemDesejado: true,
                itemOfertado: true,
                quemRecebeu: {
                    select: {
                        nome: true 
                    }
                }
            }
        });
        res.json(propostas);
    } catch (error) {
        console.error("Erro ao buscar propostas feitas:", error);
        res.status(500).json({ error: 'Erro ao buscar propostas feitas' });
    }
};


const getPropostasRecebidas = async (req, res) => {
    const userId = req.user.id;
    try {
        const propostas = await prisma.proposta.findMany({
            where: { quemRecebeuId: userId },
            include: {
                itemDesejado: true,
                itemOfertado: true,
                quemFez: { select: { id: true, nome: true } }
            }
        });
        res.json(propostas);
    } catch (error) {
        console.error("Erro ao buscar propostas recebidas:", error);
        res.status(500).json({ error: 'Erro ao buscar propostas recebidas' });
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
                itemDesejado: { select: { usuarioResponsavelId: true } },
                quemFez: { select: { id: true } }
            }
        });

        if (!proposta) {
            return response.status(404).json({ error: "Proposta não encontrada." });
        }

        if (proposta.status === 'aceita' || proposta.status === 'recusada') {
            return response.status(400).json({ error: "Esta proposta já foi aceita ou recusada." });
        }

        if (!isAdmin && proposta.itemDesejado.usuarioResponsavelId !== userIdFromToken) {
            return response.status(403).json({ error: "Você não tem permissão para aceitar/recusar esta proposta." });
        }

        const propostaRecusada = await prisma.proposta.update({
            where: { id },
            data: {
                status: 'recusada',
                dataResposta: new Date(),
                responsabilidadeAceita: false
            }
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

    try {
        const proposta = await prisma.proposta.findUnique({
            where: { id },
            select: {
                quemFezId: true,
                status: true
            }
        });

        if (!proposta) {
            return response.status(404).json({ error: "Proposta não encontrada." });
        }

        //apenas o utilizador que fez a proposta pode apagá-la
        if (proposta.quemFezId !== userIdFromToken) {
            return response.status(403).json({ error: "Não tem permissão para cancelar esta proposta." });
        }

        //apenas propostas pendentes podem ser canceladas
        if (proposta.status !== 'pendente') {
            return response.status(400).json({ error: `Não é possível cancelar uma proposta com status '${proposta.status}'.` });
        }

        await prisma.proposta.delete({
            where: { id }
        });

        return response.status(204).send();
    } catch (error) {
        console.error("Erro ao apagar proposta:", error);
        return response.status(500).json({ error: "Erro interno ao apagar a proposta." });
    }
};


const propostasController = {
    createProposta,
    aceitarProposta,
    recusarProposta,
    getPropostas,
    getPropostaById,
    deleteProposta,
    getPropostasFeitas,
    getPropostasRecebidas
};

export default propostasController;