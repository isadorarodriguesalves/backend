# API de Gestão de Loja

## Objetivo

Esta API fornece operações HTTP para administrar dados de uma loja. Ela permite
cadastrar e consultar usuários, funcionários, clientes, categorias, fornecedores
e produtos, além de registrar estoque, entradas, saídas, movimentações e pedidos
com seus itens.

## Tecnologias e formato

- Node.js com Express.
- MySQL como banco de dados.
- Os dados enviados e recebidos pela API são JSON.
- O servidor usa a porta definida em `PORT`; se não houver configuração, usa a
  porta `5000`.
- O acesso ao banco é configurado pelas variáveis de ambiente `DB_HOST`,
  `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.

Com o servidor local na porta padrão, a URL base é `http://localhost:5000`.

## Recursos e rotas

As rotas abaixo são relativas à URL base. Para os recursos com CRUD padrão,
estão disponíveis:

| Método | Caminho | Funcionalidade |
|---|---|---|
| `GET` | `/recurso` | Lista os registros. |
| `GET` | `/recurso/:id` | Consulta um registro pelo ID. |
| `POST` | `/recurso` | Cria um registro. |
| `PATCH` | `/recurso/:id` | Atualiza parcialmente um registro. |
| `DELETE` | `/recurso/:id` | Remove um registro. |

O nome `recurso` é substituído pelos caminhos da tabela:

| Caminho | Recurso | Campos aceitos na criação e atualização |
|---|---|---|
| `/usuario` | Usuários | `nome`, `email`, `senha`, `contato`, `genero`, `ativo` |
| `/funcionario` | Funcionários | `nome`, `cargo`, `salario`, `telefone`, `email`, `data_admissao`, `ativo` |
| `/cliente` | Clientes | `nome`, `email`, `contato`, `ativo` |
| `/categoria` | Categorias | `nome`, `descricao`, `ativo` |
| `/fornecedor` | Fornecedores | `nome`, `empresa`, `email`, `telefone`, `cidade`, `estado`, `ativo` |
| `/produto` | Produtos | `nome`, `descricao`, `preco`, `imagem_produto`, `id_categoria` |
| `/estoque` | Estoque | `id_produto`, `quantidade`, `estoque_minimo`, `estoque_maximo`, `localizacao` |
| `/entrada` | Entradas de produtos | `id_produto`, `id_fornecedor`, `quantidade`, `valor_unitario`, `data_entrada`, `observacao` |
| `/saida` | Saídas de produtos | `id_produto`, `id_funcionario`, `quantidade`, `valor_unitario`, `data_saida`, `destino` |
| `/movimentacao` | Movimentações | `id_produto`, `tipo`, `quantidade`, `data_movimentacao`, `observacao` |
| `/pedido` | Pedidos | `status`, `data_pedido`, `id_cliente` |
| `/pedido-item` | Itens de pedido | `id_pedido`, `id_produto`, `quantidade`, `valor_unitario`, `subtotal` |

Os IDs são informados como números positivos no parâmetro `:id`. Os campos
obrigatórios e os tipos aceitos variam conforme o recurso. Campos não listados
para um recurso não são usados nas operações de criação ou atualização.

### Login de usuário

`POST /usuario/login` verifica o email e a senha de um usuário ativo.

Exemplo de requisição:

```http
POST /usuario/login
Content-Type: application/json
```

```json
{
  "email": "usuario@email.com",
  "senha": "minha-senha"
}
```

Em caso de sucesso, a resposta inclui uma mensagem e os dados do usuário, sem a
senha:

```json
{
  "mensagem": "Login realizado com sucesso!",
  "usuario": {
    "id_usu": 1,
    "nome": "Nome do usuário",
    "email": "usuario@email.com",
    "contato": null,
    "genero": null,
    "ativo": 1
  }
}
```

O cadastro e a atualização de senha armazenam a senha usando bcrypt. Para
compatibilidade, senhas antigas em texto puro são verificadas no login e
convertidas para hash após uma validação bem-sucedida.

**Importante:** o login apenas valida as credenciais e retorna os dados do
usuário. Atualmente, a API não gera token de autenticação nem protege as demais
rotas com uma sessão autenticada.

## Exemplos de uso

Criar um cliente:

```http
POST /cliente
Content-Type: application/json
```

```json
{
  "nome": "Ana Souza",
  "email": "ana@example.com",
  "contato": "63999990000"
}
```

Consultar um produto pelo ID:

```http
GET /produto/1
```

Atualizar a quantidade de um registro de estoque:

```http
PATCH /estoque/1
Content-Type: application/json
```

```json
{
  "quantidade": 25
}
```

## Respostas e erros

As respostas bem-sucedidas retornam JSON. Em geral, as operações de criação
retornam `201`; consultas e atualizações, `200`.

Erros de validação podem retornar `400`, registros não encontrados retornam
`404` e credenciais inválidas no login retornam `401`. Erros internos retornam
`500` com uma mensagem genérica:

```json
{
  "erro": {
    "mensagem": "Erro interno do servidor."
  }
}
```

O middleware de CORS está habilitado para todas as origens.
