const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

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
    // Verifica se é um inteiro estrito (ex: rejeita "abc", "1.5", "-1", "0")
    if (!/^[1-9]\d*$/.test(idStr)) {
        return sendError(res, 400, 'ID Inválido', `O id '${idStr}' não é um inteiro positivo.`);
    }
    req.itemId = parseInt(idStr, 10);
    next();
}

// --- ENDPOINTS REST PARA /api/items ---

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

app.get('/api/items/:id', validateId, (req, res) => {
    const item = items.find(i => i.id === req.itemId);
    if (!item) {
        return sendError(res, 404, 'Não encontrado', `Não existe item com id ${req.itemId}`);
    }
    res.json(item);
});

app.post('/api/items', (req, res) => {
    const { name } = req.body;

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

app.delete('/api/items/:id', validateId, (req, res) => {
    const itemIndex = items.findIndex(i => i.id === req.itemId);
    if (itemIndex === -1) {
        return sendError(res, 404, 'Não encontrado', `Não existe item com id ${req.itemId}`);
    }

    items.splice(itemIndex, 1);
    res.status(204).send();
});

const schema = buildSchema(`
    type Item {
    id: Int!
    name: String!
    }

    type Query {
    items: [Item]
    item(id: Int!): Item
    }

    type Mutation {
    createItem(name: String!): Item
    updateItem(id: Int!, name: String!): Item
    }
`);

const root = {
    items: () => items,
    
    item: ({ id }) => {
        const found = items.find(i => i.id === id);
        if (!found) {
            throw new Error(`Não existe item com id ${id}`);
        }
        return found;
    },

    createItem: ({ name }) => {
        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new Error("O campo 'name' é obrigatório e deve ser um texto válido.");
        }
        const newItem = {
            id: nextId++,
            name: name.trim()
        };
        items.push(newItem);
        return newItem;
    },

    updateItem: ({ id, name }) => {
        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new Error("O campo 'name' é obrigatório e deve ser um texto válido.");
        }
        const index = items.findIndex(i => i.id === id);
        if (index === -1) {
            throw new Error(`Não existe item com id ${id}`);
        }
        items[index].name = name.trim();
        return items[index];
    }
};

// Endpoint GraphQL integrado
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Permite testar visualmente no browser em http://localhost:3000/graphql
}));


// --- TRATAMENTO DE ROTAS E ERROS ---

app.use((req, res) => {
    sendError(res, 404, 'Rota não encontrada', `A rota ${req.originalUrl} não existe.`);
});

app.use((err, req, res, next) => {
    sendError(res, 400, 'Erro no pedido', 'Ocorreu um erro ao processar o JSON ou os dados enviados.');
});

app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});