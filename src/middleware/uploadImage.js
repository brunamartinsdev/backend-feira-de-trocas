import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
    }
});

export const uploadSingleImage = (request, response, next) => 
    upload.single('imagem')(request, response, (err) => {
        if (err) {
            console.error("--> Multer Middleware (single): Erro durante o processamento Multer:", err);
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return response.status(413).json({ error: "Arquivo muito grande! O limite é de 5MB." });
                }
            }
            if (err.message === 'Apenas arquivos de imagem são permitidos!') {
                return response.status(400).json({ error: err.message });
            }
            return response.status(500).json({ error: "Erro interno no processamento do arquivo." });
        }
        next();
    });