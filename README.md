# LEI022 - Laboratório de Desenvolvimento de Software
## TP1: Primeira API REST (Ano letivo 2026/27)

* **Estudante:** Tomás António
* **Número de Estudante:** 240001360

---

## 1. Versão do Node.js
* **Versão utilizada:** Node.js v23.8.0 (LTS)

---

## 2. Instruções de Instalação e Execução

A partir da raiz do repositório, navegue para a pasta `backend/`:

```bash
cd backend

```
## 5. Testes Realizados (Pedido · Esperado · Obtido)

| Pedido | Esperado | Obtido | Objetivo |
| :--- | :--- | :--- | :--- |
| `GET /api/items` | `200` | `200` | Consultar coleção |
| `GET /api/items/1` | `200` | `200` | Recurso existente |
| `GET /api/items/999` | `404` | `404` | Recurso inexistente |
| `GET /api/items/abc` | `400` | `400` | ID inválido |
| `GET /api/items?name=can` | `200` | `200` | Filtro por nome (case-insensitive) |
| `GET /api/items?name=xyz` | `200 + []` | `200 + []` | Filtro sem resultados |
| `POST /api/items` (válido) | `201 + Location` | `201 + Location` | Criação de recurso |
| `POST /api/items` (inválido) | `400` | `400` | Validação de corpo |
| `POST /api/items` (sem corpo) | `400` | `400` | Corpo em falta |
| `POST /api/items` (JSON malformado) | `400` | `400` | Corpo ilegível |
| `PUT /api/items/1` (válido) | `200` | `200` | Atualização de recurso |
| `PUT /api/items/999` | `404` | `404` | Recurso inexistente |
| `PUT /api/items/abc` | `400` | `400` | ID inválido |
| `DELETE /api/items/1` | `204` | `204` | Remoção de recurso |
| `DELETE /api/items/999` | `404` | `404` | Recurso inexistente |
| `DELETE /api/items/abc` | `400` | `400` | ID inválido |
| `GET /api/xpto` (rota desconhecida) | `404` (Problem Details) | `404` (Problem Details) | Rota inexistente |
| Recurso Adicional: POST válido | `201` | `201` | Sucesso no recurso adicional |
| Recurso Adicional: Estado inválido | `400` | `400` | Valores permitidos violados |
| Recurso Adicional: Título duplicado | `409` | `409` | Regra de conflito violada |

## O uso da Inteligência Artificial

Gemini Google, ajudou-me a configurar o git com o github, a parte do projeto que ajudou me foi backend, parte dos api do postman e validou:
- Testes Automatizados
- Códigos de Estado HTTP
- Tratamento de Erros e Validações
- Tabela Pedido · Esperado · Obtido