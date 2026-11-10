# LEI022 - Laboratório de Desenvolvimento de Software
## TP3: Persistência e Relações na API (Ano letivo 2026/27)

* **Estudante:** Tomás António
* **Número de Estudante:** 240001360

---

## 1. Versão do Node.js e Tecnologias
* **Node.js:** v23.8.0 (LTS)
* **Base de Dados:** PostgreSQL
* **ORM:** Prisma

---

## 2. Instruções de Instalação, Configuração e Execução

A partir da raiz do repositório, navegue para a pasta `backend/`:

```bash
cd backend

```
Instale os pacotes necessários na pasta `backend/`:

```bash
npm install

```
Crie um ficheiro `.env` na pasta `backend/` com a string de ligação à sua base de dados PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:Ips30354093@localhost:5432/TP-lei2022?schema=public"

```
Execute as migrações do Prisma para criar as tabelas necessárias:

```bash
npx prisma migrate dev --name init

```
Inicie o servidor na pasta `backend/`:

```bash
node server.js

```

## 3. Comparação e Justificação Técnica

* Padrão de comunicação e direção do fluxo:
REST: Segue o modelo tradicional de pedido-resposta baseado em recursos mapeados a múltiplos URLs e verbos HTTP (GET, POST, PUT, DELETE).
GraphQL: Utilizou um único endpoint central (/graphql) onde o cliente envia pedidos em formato de grafos para obter exatamente os dados pretendidos numa única requisição.

* Adequação ao requisito e aos clientes envolvidos:
O GraphQL adequou-se perfeitamente a clientes móveis ou web que necessitem de flexibilidade para requisitar propriedades específicas sem sobrecarregar a rede com dados desnecessários.

* Complexidade de implementação e operação:
A implementação exigiu a definição de um schema rígido e resolvers em memória, sendo ligeiramente mais complexa de configurar inicialmente do que as rotas diretas do Express em REST.

* Tratamento de erros, validação e limitações relevantes:
Em REST, os erros são mapeados diretamente para códigos de estado HTTP padronizados (ex: 400, 404).
No GraphQL, a validação de argumentos e recursos inexistentes foi tratada nos resolvers através de exceções que devolvem mensagens estruturadas, embora o protocolo HTTP responda frequentemente com código 200.

* Vantagem e desvantagem no contexto do projeto:
Vantagem: Eliminação do over-fetching, permitindo ao cliente pedir apenas o campo (name) de um item sem receber dados adjacentes desnecessários.
Desvantagem: Maior complexidade na gestão de erros e na cache a nível de rede, visto que quase todas as interações passam obrigatoriamente por um único método e endpoint HTTP (POST /graphql).

* Relações e Persistência (TP3)
O projeto evoluiu para uma arquitetura persistente baseada em PostgreSQL com o Prisma ORM. Foi modelada uma relação 1:N entre Category e Item (uma categoria possui múltiplos itens). A base de dados assegura a integridade referencial, restrições de unicidade e a persistência dos dados mesmo após reiniciar a aplicação.

## 5. Testes Realizados (Pedido · Esperado · Obtido)

| Pedido | Esperado | Obtido | Objetivo |
| :--- | :--- | :--- | :--- |
| `POST /api/categories` | `201 Created` | `201 Created` | Criar nova categoria |
| `POST /api/categories (Duplicado)` | `409 Conflit` | `409 Conflit` | Validação de nome único de categoria |
| `POST /api/items` | `201 Created` | `201 Created` | Criar item associado a uma categoria |
| `GET /api/items` | `200 OK` | `200 OK` | Consultar itens com relação de categoria incluída |
| `GET /api/items/999` | `404 Not Found` | `404 Not Found` | Recurso inexistente |
| `POST /api/items (categoria inválida)` | `400 Bad Request` | `400 Bad Request` | Validação de chave estrangeira |
| `POST /api/items (nome duplicado)` | `409 Conflict` | `409 Conflict` | Violação de restrição única no Prisma |
| `DELETE /api/items/1` | `204 No Content` | `204 No Content` | Remoção de recurso persistido |

## O uso da Inteligência Artificial

Gemini Google ajudou-me a configurar o git com o github, a estruturar o código do backend com o Prisma ORM e PostgreSQL, a adaptar o tratamento de erros e códigos de estado HTTP para a persistência, e a estruturar a documentação e tabela de testes
- Testes Automatizados
- Códigos de Estado HTTP
- Tratamento de Erros e Validações
- Tabela Pedido · Esperado · Obtido
- Correção de escrita
- Estrutura do repositório