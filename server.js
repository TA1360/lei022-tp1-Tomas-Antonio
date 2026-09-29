const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Dados em memória
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
    // Verifica se é um inteiro estrito (ex: rejeita "abc", "1.5", "-1", "0")
    if (!/^[1-9]\d*$/.test(idStr)) {
    return sendError(res, 400, 'ID Inválido', `O id '${idStr}' não é um inteiro positivo.`);
    }
    req.itemId = parseInt(idStr, 10);
    next();
}

// --- ENDPOINTS PARA /api/items ---

// GET /api/items (Coleção ou com filtro por name)
app.get('/api/items', (req, res) => {
    const { name } = req.query;
    
    if (name !== undefined) {
    const searchTerm = name.trim().toLowerCase();
    if (!searchTerm) {
        return res.json([]);
    }
    const filtered = items.filter(item => item.name.toLowerCase().includes(searchTerm));
    return res.json(filtered);
    }

    res.json(items);
});

// GET /api/items/:id
app.get('/api/items/:id', validateId, (req, res) => {
    const item = items.find(i => i.id === req.itemId);
    if (!item) {
    return sendError(res, 404, 'Não encontrado', `Não existe item com id ${req.itemId}`);
    }
    res.json(item);
});

// POST /api/items
app.post('/api/items', (req, res) => {
    const { name } = req.body;

    // Validação do corpo e do campo name
    if (!name || typeof name !== 'string' || !name.trim()) {
    return sendError(res, 400, 'Requisição Inválida', `O campo 'name' é obrigatório e deve ser um texto válido.`);
    }

    const cleanName = name.trim();

    const newItem = {
    id: nextId++,
    name: cleanName
    };

    items.push(newItem);

    res.status(201)
        .setHeader('Location', `/api/items/${newItem.id}`)
        .json(newItem);
});

// PUT /api/items/:id
app.put('/api/items/:id', validateId, (req, res) => {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
    return sendError(res, 400, 'Requisição Inválida', `O campo 'name' é obrigatório e deve ser um texto válido.`);
    }

    const itemIndex = items.findIndex(i => i.id === req.itemId);
    if (itemIndex === -1) {
    return sendError(res, 404, 'Não encontrado', `Não existe item com id ${req.itemId}`);
    }

    items[itemIndex].name = name.trim();
    res.json(items[itemIndex]);
});

// DELETE /api/items/:id
app.delete('/api/items/:id', validateId, (req, res) => {
    const itemIndex = items.findIndex(i => i.id === req.itemId);
    if (itemIndex === -1) {
    return sendError(res, 404, 'Não encontrado', `Não existe item com id ${req.itemId}`);
    }

    items.splice(itemIndex, 1);
    res.status(204).send();
});

// Tratamento para rotas desconhecidas (404)
app.use((req, res) => {
    sendError(res, 404, 'Rota não encontrada', `A rota ${req.originalUrl} não existe.`);
});

// Tratamento global de erros inesperados (evita dar 500 sem formato JSON)
app.use((err, req, res, next) => {
    sendError(res, 400, 'Erro no pedido', 'Ocorreu um erro ao processar o JSON ou os dados enviados.');
});

app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});