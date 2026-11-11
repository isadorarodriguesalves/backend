# API de Gestão de Loja

## Nome e objetivo

A **API de Gestão de Loja** é um serviço HTTP para cadastrar, consultar,
atualizar e remover informações operacionais de uma loja. Ela centraliza os
dados de usuários, funcionários, clientes, fornecedores, categorias, produtos,
estoque, entradas e saídas de produtos, movimentações e pedidos.

## Problema que resolve

A API oferece uma interface única para que aplicações clientes gerenciem os
registros da loja por meio de requisições HTTP, em vez de acessar diretamente o
banco de dados. Ela também valida os dados recebidos e fornece respostas
estruturadas em JSON.

## Tecnologias e arquitetura

- **Node.js**: ambiente de execução do backend.
- **Express**: criação do servidor HTTP, middleware e rotas.
- **Sequelize**: ORM que mapeia as tabelas do banco para modelos JavaScript e
  executa consultas e gravações sem exigir SQL manual em cada operação.
- **MySQL**: banco de dados relacional utilizado pela aplicação.
- **mysql2**: driver de conexão entre Sequelize e MySQL.
- **bcryptjs**: geração e verificação de hashes de senha.
- **dotenv**: leitura das configurações locais a partir de variáveis de
  ambiente.
- **CORS**: middleware que habilita requisições de origens cruzadas.

Os modelos mapeiam tabelas existentes. A inicialização da aplicação valida a
conexão com o MySQL, mas não cria nem altera o esquema. O banco e suas tabelas
devem estar preparados antes de iniciar o servidor.

## Instalação e execução local

Requisitos: Node.js/npm e uma instância MySQL acessível com o esquema esperado
pela aplicação.

1. Instale as dependências na raiz do projeto:

   ```sh
   npm install
   ```

2. Configure as variáveis de ambiente descritas abaixo. Não compartilhe nem
   versione valores secretos.
3. Garanta que o banco de dados e as tabelas da aplicação já existam.
4. Inicie o servidor:

   ```sh
   npm start
   ```

O comando `npm start` executa `node server.js`; para desenvolvimento com
reinicialização automática, use `npm run start:dev`. A aplicação verifica a
conexão com o banco antes de começar a aceitar requisições e encerra a conexão
de forma controlada ao receber `SIGINT` ou `SIGTERM`. A porta é definida por
`PORT` ou, se a variável não estiver configurada, usa `5000`.

## Variáveis de ambiente

Configure estas variáveis no ambiente de execução ou em um arquivo `.env`
local, que não deve ser compartilhado:

| Variável | Finalidade |
|---|---|
| `DB_HOST` | Host do servidor MySQL. |
| `DB_PORT` | Porta do MySQL; usa `3306` se não estiver definida. |
| `DB_USER` | Usuário utilizado para conectar ao MySQL. |
| `DB_PASSWORD` | Senha do usuário do MySQL. |
| `DB_NAME` | Nome do banco de dados. |
| `PORT` | Porta HTTP da API; usa `5000` se não estiver definida. |
| `DB_SSL` | Define `true` para exigir TLS com validação do certificado MySQL; padrão `false`. |
| `CORS_ORIGINS` | Lista de origens web permitidas, separadas por vírgula. Em produção, origens não listadas não recebem permissão CORS. |
| `JWT_SECRET` | Segredo aleatório de pelo menos 32 bytes usado para assinar tokens de acesso. Obrigatório para iniciar a API. |

Este documento não inclui valores de configuração ou credenciais.

## Endereço da API

Em execução local com a porta padrão, a URL base é
`http://localhost:5000`.

Em produção no Render, a URL base é `https://backend-6apy.onrender.com`.

## Página inicial

Uma requisição `GET /` exibe uma página HTML com uma breve apresentação da API
e lista seus recursos. As rotas dos recursos retornam JSON e exigem um token
Bearer obtido pelo endpoint de login.

## Formato das requisições e respostas

As rotas que recebem dados esperam JSON com o cabeçalho
`Content-Type: application/json`. As respostas da API também são JSON.
Requisições de leitura (`GET`) não precisam de corpo. Campos e tipos aceitos
variam por recurso; os campos não listados são ignorados nas rotas CRUD
genéricas.

IDs nos caminhos `:id` devem ser números inteiros positivos. Nas rotas CRUD
genéricas, criações respondem com `201`, consultas e atualizações com `200`,
validações inválidas com `400`, registros ausentes com `404` e erros internos
com `500`. Os erros do middleware global usam este formato:

```json
{
  "erro": {
    "mensagem": "Erro interno do servidor."
  }
}
```

Algumas rotas retornam erros de validação diretamente no formato
`{"mensagem":"..."}`. O login responde `401` quando as credenciais não são
aceitas.

## Rotas disponíveis

### Operações CRUD

As rotas abaixo usam estes métodos para cada recurso:

| Método | Caminho | Finalidade |
|---|---|---|
| `GET` | `/recurso` | Listar os registros do recurso. |
| `GET` | `/recurso/:id` | Consultar um registro pelo ID. |
| `POST` | `/recurso` | Cadastrar um registro. |
| `PATCH` | `/recurso/:id` | Atualizar parcialmente um registro. |
| `DELETE` | `/recurso/:id` | Remover um registro. |

Substitua `/recurso` pelos caminhos da tabela. Para criação, os campos
obrigatórios indicados devem ser enviados; os demais campos listados são
opcionais quando não houver regra diferente na aplicação.

| Caminho | Finalidade | Campos aceitos | Obrigatórios na criação |
|---|---|---|---|
| `/usuario` | Usuários | `nome`, `email`, `senha`, `contato`, `genero`, `ativo` | `nome`, `email`, `senha` |
| `/funcionario` | Funcionários | `nome`, `cargo`, `salario`, `telefone`, `email`, `data_admissao`, `ativo` | `nome`, `cargo`, `salario` |
| `/cliente` | Clientes | `nome`, `email`, `contato`, `ativo` | `nome`, `email` |
| `/categoria` | Categorias | `nome`, `descricao`, `ativo` | `nome` |
| `/fornecedor` | Fornecedores | `nome`, `empresa`, `email`, `telefone`, `cidade`, `estado`, `ativo` | `nome` |
| `/produto` | Produtos | `nome`, `descricao`, `preco`, `imagem_produto`, `id_categoria` | `descricao`, `imagem_produto` |
| `/estoque` | Registros de estoque | `id_produto`, `quantidade`, `estoque_minimo`, `estoque_maximo`, `localizacao` | `id_produto`, `quantidade` |
| `/entrada` | Entradas de produtos | `id_produto`, `id_fornecedor`, `quantidade`, `valor_unitario`, `data_entrada`, `observacao` | `id_produto`, `id_fornecedor`, `quantidade`, `valor_unitario` |
| `/saida` | Saídas de produtos | `id_produto`, `id_funcionario`, `quantidade`, `valor_unitario`, `data_saida`, `destino` | `id_produto`, `id_funcionario`, `quantidade`, `valor_unitario` |
| `/movimentacao` | Movimentações de produtos | `id_produto`, `tipo`, `quantidade`, `data_movimentacao`, `observacao` | Nenhum campo exigido pela validação da rota |
| `/pedido` | Pedidos | `status`, `data_pedido`, `id_cliente` | Nenhum campo exigido pela validação da rota |
| `/pedido-item` | Itens de pedido | `id_pedido`, `id_produto`, `quantidade`, `valor_unitario`, `subtotal` | Nenhum campo exigido pela validação da rota |

Para `/movimentacao`, os valores aceitos para `tipo` são `E`, `S`, `A`, `P` e
`T`. As demais regras de validação dependem dos campos e dos tipos definidos
para cada recurso.

### Login

| Método | Caminho | Finalidade |
|---|---|---|
| `POST` | `/usuario/login` | Validar o email e a senha de um usuário ativo. |

Exemplo de requisição:

```http
POST /usuario/login
Content-Type: application/json
```

```json
{
  "email": "usuario@example.com",
  "senha": "senha-de-teste"
}
```

Em caso de sucesso, a resposta é `200 OK`, inclui os dados do usuário e não
inclui a senha. Também retorna um token Bearer válido por uma hora:

```json
{
  "mensagem": "Login realizado com sucesso!",
  "token": "<token de acesso>",
  "expiresIn": 3600,
  "usuario": {
    "id_usu": 1,
    "nome": "Nome do usuário",
    "email": "usuario@example.com",
    "contato": null,
    "genero": null,
    "ativo": 1
  }
}
```

Email ou senha inválidos, assim como uma conta inativa, resultam em `401` e na
mensagem `Email ou senha inválidos.`. A ausência de email ou senha resulta em
`400`.

### Exemplos de cadastro e teste de login

Cadastre um usuário enviando `POST /usuario` com JSON. `nome`, `email` e
`senha` são obrigatórios; `contato`, `genero` e `ativo` são opcionais:

```http
POST /usuario
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "nome": "Usuário de teste",
  "email": "usuario-teste@example.com",
  "senha": "troque-esta-senha"
}
```

Uma criação bem-sucedida responde com `201 Created` e o ID gerado. A senha é
armazenada usando bcrypt. Em seguida, use o mesmo email e senha em
`POST /usuario/login`, como no exemplo da seção anterior. Use credenciais de
teste; não coloque senhas reais em documentação, histórico ou repositório.

## Autenticação e acesso às rotas

Somente `GET /` e `POST /usuario/login` são públicos. Todas as rotas de dados,
incluindo as operações CRUD de `/usuario`, exigem o cabeçalho
`Authorization: Bearer <token>` retornado pelo login. Tokens inválidos,
expirados ou ausentes recebem `401 Unauthorized`. As contas autenticadas têm as
mesmas permissões; a API ainda não diferencia papéis ou níveis de acesso.

Exemplo de chamada autenticada:

```http
GET /produto
Authorization: Bearer <token>
```

Configure `JWT_SECRET` no ambiente da API com um valor aleatório de pelo menos
32 bytes. Gere um valor com
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
Não inclua o segredo em código, documentação versionada ou controle de versão.
No Render, configure `JWT_SECRET` nas variáveis de ambiente do serviço antes
do próximo deploy; sem essa variável, a API não inicia. Os tokens expiram após
uma hora; faça login novamente para obter outro.

As senhas cadastradas e atualizadas são armazenadas com bcrypt. Para
compatibilidade, senhas antigas armazenadas em texto puro podem ser validadas e
convertidas para hash após um login bem-sucedido.

## CORS

Em desenvolvimento, o middleware CORS permite todas as origens se
`CORS_ORIGINS` não estiver definida. Em produção, configure essa variável com
as origens exatas dos clientes web, separadas por vírgula, por exemplo
`https://loja.example.com,https://admin.example.com`; origens de navegador não
listadas não recebem cabeçalhos CORS. Os métodos permitidos incluem `GET`,
`POST`, `PUT`, `PATCH`, `DELETE` e `OPTIONS`.

CORS limita quais páginas web podem ler respostas no navegador; não é
autenticação e não impede chamadas diretas à API. A autenticação Bearer é
validada pela API. Use um usuário MySQL dedicado, com acesso somente às tabelas
necessárias e privilégios de leitura e gravação (SELECT, INSERT, UPDATE e
DELETE); não conceda privilégios administrativos ou de alteração de esquema
em produção, pois a aplicação não executa migrações.
