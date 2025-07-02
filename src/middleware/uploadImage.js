import multer from 'multer';

const storage = multer.memoryStorage(); //para salvar direto da memória

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 //limite do tamanho arquivo
    },
    fileFilter: (req, file, cb) => {
        //  para aceitar só imagens
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
    }
});

//para fazer upload de somente uma única imagem
export const uploadSingleImage = upload.single('imagem'); //'imagem' é o nome do campo no formulário HTML/FormData