const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Dados em memória (partilhados entre REST e GraphQL)
let items = [
    { id: 1, name: 'Caneta' },
    { id: 2, name: 'Caderno' }
];

let nextId = 3;

// Helper para formato de erro (RFC 9457)
function sendError(res, status, title, detail) {
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(status).json({ status, title, detail });
}

// Middleware para validar se o ID é um inteiro positivo
function validateId(req, res, next) {
    const idStr = req.params.id;
    if (!/^[1-9]\d*$/.test(idStr)) {
        return sendError(res, 400, 'ID Inválido', `O id '${idStr}' não é um inteiro positivo.`);
    }
    req.itemId = parseInt(idStr, 10);
    next();
}

// --- ENDPOINTS REST COM PRISMA (TP3) ---

// GET /api/items (Coleção ou com filtro por name)
app.get('/api/items', async (req, res) => {
    try {
        const { name } = req.query;
        let items;

        if (name !== undefined) {
            const searchTerm = name.trim();
            if (!searchTerm) {
                return res.json([]);
            }
            items = await prisma.item.findMany({
                where: {
                    name: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                include: { category: true } // Inclui a relação com a categoria
            });
        } else {
            items = await prisma.item.findMany({
                include: { category: true }
            });
        }

        res.json(items);
    } catch (error) {
        sendError(res, 500, 'Erro interno', 'Ocorreu um erro ao consultar os itens na base de dados.');
    }
});

// GET /api/items/:id
app.get('/api/items/:id', validateId, async (req, res) => {
    try {
        const item = await prisma.item.findUnique({
            where: { id: req.itemId },
            include: { category: true }
        });

        if (!item) {
            return sendError(res, 404, 'Não encontrado', `Não existe item com id ${req.itemId}`);
        }
        res.json(item);
    } catch (error) {
        sendError(res, 500, 'Erro interno', 'Ocorreu um erro ao consultar o item.');
    }
});

// POST /api/items (Com suporte a categoria e transação se necessário)
app.post('/api/items', async (req, res) => {
    try {
        const { name, categoryId } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return sendError(res, 400, 'Requisição Inválida', `O campo 'name' é obrigatório e deve ser um texto válido.`);
        }

        if (!categoryId || typeof categoryId !== 'number') {
            return sendError(res, 400, 'Requisição Inválida', `O campo 'categoryId' é obrigatório e deve ser um número.`);
        }

        // Verifica se a categoria existe
        const categoryExists = await prisma.category.findUnique({
            where: { id: categoryId }
        });

        if (!categoryExists) {
            return sendError(res, 400, 'Categoria inválida', `A categoria com id ${categoryId} não existe.`);
        }

        const cleanName = name.trim();

        const newItem = await prisma.item.create({
            data: {
                name: cleanName,
                categoryId: categoryId
            },
            include: { category: true }
        });

        res.status(201)
            .setHeader('Location', `/api/items/${newItem.id}`)
            .json(newItem);
    } catch (error) {
        // Tratamento de violação de valor único (ex: nome do item duplicado)
        if (error.code === 'P2002') {
            return sendError(res, 409, 'Conflito', 'Já existe um item com esse nome.');
        }
        sendError(res, 500, 'Erro interno', 'Ocorreu um erro ao criar o item.');
    }
});

// PUT /api/items/:id
app.put('/api/items/:id', validateId, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return sendError(res, 400, 'Requisição Inválida', `O campo 'name' é obrigatório e deve ser um texto válido.`);
        }

        const updatedItem = await prisma.item.update({
            where: { id: req.itemId },
            data: { name: name.trim() },
            include: { category: true }
        });

        res.json(updatedItem);
    } catch (error) {
        // Registo não encontrado no Prisma
        if (error.code === 'P2025') {
            return sendError(res, 404, 'Não encontrado', `Não existe item com id ${req.itemId}`);
        }
        sendError(res, 500, 'Erro interno', 'Ocorreu um erro ao atualizar o item.');
    }
});

// DELETE /api/items/:id
app.delete('/api/items/:id', validateId, async (req, res) => {
    try {
        await prisma.item.delete({
            where: { id: req.itemId }
        });

        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') {
            return sendError(res, 404, 'Não encontrado', `Não existe item com id ${req.itemId}`);
        }
        sendError(res, 500, 'Erro interno', 'Ocorreu um erro ao remover o item.');
    }
});

// --- ROTA EXTRA PARA CRIAR CATEGORIAS (Útil para testar relações) ---
app.post('/api/categories', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return sendError(res, 400, 'Requisição Inválida', "O campo 'name' da categoria é obrigatório.");
        }

        const newCategory = await prisma.category.create({
            data: { name: name.trim() }
        });

        res.status(201).json(newCategory);
    } catch (error) {
        if (error.code === 'P2002') {
            return sendError(res, 409, 'Conflito', 'Essa categoria já existe.');
        }
        sendError(res, 500, 'Erro interno', 'Erro ao criar categoria.');
    }
});

// Tratamento de rotas desconhecidas (404)
app.use((req, res) => {
    sendError(res, 404, 'Rota não encontrada', `A rota ${req.originalUrl} não existe.`);
});

app.listen(PORT, () => {
    console.log(`Servidor TP3 a correr em http://localhost:${PORT}`);
});