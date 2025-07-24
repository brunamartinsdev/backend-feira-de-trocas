import prisma from "../models/prismaClient.js";
import cloudinary from '../config/cloudinaryConfig.js';

const getItens = async (request, response) => {
    const { categoria, busca, usuarioResponsavelId, status } = request.query;
    
    const where = {
        status: status || "Disponível"
    };

    if (categoria) {
        where.categoria = {
            equals: String(categoria),
            mode: "insensitive"
        };
    }
    if (busca) {
        where.OR = [
            { nome: { contains: String(busca), mode: "insensitive" } },
            { descricao: { contains: String(busca), mode: "insensitive" } },
            { categoria: { contains: String(busca), mode: "insensitive" } },
        ];
    }
    if (usuarioResponsavelId) {
        where.usuarioResponsavelId = String(usuarioResponsavelId);
    }

    try {
        const itens = await prisma.item.findMany({
            where,
            include: {
                usuarioResponsavel: {
                    select: { id: true, nome: true, email: true }
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

const getItensDoUsuarioLogado = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query; 

        const where = {
            usuarioResponsavelId: userId
        };

        if (status) {
            where.status = status;
        }

        const itens = await prisma.item.findMany({
            where: where 
        });
        res.status(200).json(itens);
    } catch (error) {
        console.error("Erro ao buscar itens do utilizador:", error);
        res.status(500).json({ error: "Erro ao buscar itens do utilizador logado" });
    }
};

const createItem = async (request, response) => {
  const { nome, descricao, categoria, foto } = request.body; 
  const usuarioResponsavelId = request.user.id;

  try {
    if (!foto) {
      return response.status(400).json({ error: "A imagem do item é obrigatória." });
    }

    const item = await prisma.item.create({
      data: {
        nome,
        descricao,
        categoria,
        status: "Disponível",
        foto, 
        usuarioResponsavel: { connect: { id: usuarioResponsavelId } }
      }
    });

    return response.status(201).json(item);
  } catch (error) {
    console.error("Erro ao cadastrar item: ", error);
    return response.status(500).json({ error: "Erro interno ao cadastrar item." });
  }
};


const updateItem = async (request, response) => {
    const { id } = request.params;
    const { nome, descricao, categoria, status } = request.body;
    const userIdFromToken = request.user.id;
    const isAdmin = request.user.isAdmin;

    try {
        const itemExiste = await prisma.item.findUnique({
            where: { id }
        });

        if (!itemExiste) {
            return response.status(404).json({ error: "Item não encontrado." });
        }

        if (itemExiste.usuarioResponsavelId !== userIdFromToken && !isAdmin) {
            return response.status(403).json({ error: "Você não tem permissão para atualizar este item." });
        }

        const dadosParaAtualizar = { nome, descricao, categoria, status };

        if (request.file) {
            if (itemExiste.foto) {
                try {
                    const urlAntiga = itemExiste.foto;
                    const partes = urlAntiga.split('/');
                    const nomeArquivo = partes[partes.length - 1];
                    const [publicId] = nomeArquivo.split('.');
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error("Aviso: Falha ao deletar a imagem antiga do Cloudinary.", error);
                }
            }

            const uploadPromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: "image" },
                    (error, result) => {
                        if (error) {
                            return reject(new Error("Falha no upload da imagem."));
                        }
                        resolve(result);
                    }
                );
                uploadStream.end(request.file.buffer);
            });

            const uploadResult = await uploadPromise;
            dadosParaAtualizar.foto = uploadResult.secure_url;
        }

        const itemAtualizado = await prisma.item.update({
            where: { id },
            data: dadosParaAtualizar,
        });

        return response.status(200).json(itemAtualizado);

    } catch (error) {
        console.error("Erro ao atualizar item: ", error);
        if (error.code === 'P2025') {
            return response.status(404).json({ error: "Item não encontrado" });
        }
        return response.status(500).json({ error: "Erro interno ao atualizar item" });
    }
};

const deleteItem = async (request, response) => {
    const { id } = request.params;
    const userIdFromToken = request.user.id;
    const isAdmin = request.user.isAdmin;

    try {
        const itemExiste = await prisma.item.findUnique({
            where: { id }
        });

        if (!itemExiste) {
            return response.status(404).json({ error: "Item não encontrado." });
        }

        if (itemExiste.usuarioResponsavelId !== userIdFromToken && !isAdmin) {
            return response.status(403).json({ error: "Você não tem permissão para excluir este item." });
        }

        const propostasEnvolvidas = await prisma.proposta.findFirst({
            where: {
                OR: [
                    { itemOfertadoId: id },
                    { itemDesejadoId: id }
                ],
            }
        });

        if (propostasEnvolvidas) {
            return response.status(409).json({
                error: "Este item não pode ser excluído pois está envolvido em uma ou mais propostas de troca."
            });
        }

        if (itemExiste.foto) {
            try {
                const url = itemExiste.foto;
                const uploadIndex = url.lastIndexOf('/upload/');
                const pontoIndex = url.lastIndexOf('.');

                if (uploadIndex > -1 && pontoIndex > uploadIndex) {
                    const caminhoCompleto = url.substring(uploadIndex + '/upload/'.length);
                    const partes = caminhoCompleto.split('/');
                    let publicIdParaExcluir;
                    if (partes.length > 1 && partes[0].startsWith('v') && !isNaN(parseInt(partes[0].substring(1)))) {
                        publicIdParaExcluir = partes.slice(1).join('/').split('.')[0];
                    } else {
                        publicIdParaExcluir = caminhoCompleto.split('.')[0];
                    }
                    const cloudinaryDeleteResultado = await cloudinary.uploader.destroy(publicIdParaExcluir);
                    if (cloudinaryDeleteResultado.result !== 'ok') {
                        console.warn(`Aviso: Falha ao deletar imagem '${publicIdParaExcluir}' do Cloudinary:`, cloudinaryDeleteResultado.result);
                    }
                } else {
                    console.warn(`Aviso: URL de foto inválida ou não reconhecível para exclusão do Cloudinary: ${itemExiste.foto}`);
                }
            } catch (cloudinaryError) {
                console.error(`Erro ao tentar deletar imagem do Cloudinary para ${itemExiste.foto}:`, cloudinaryError.message);
            }
        }

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
    deleteItem,
    getItensDoUsuarioLogado
};

export default itensController;
