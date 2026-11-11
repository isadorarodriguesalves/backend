// 1. Dependências e Middlewares
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const authenticate = require('./middleware/authenticate');

const app = express();

const routeUsuario = require('./route/routeUsuario');
const routeFuncionario = require('./route/routeFuncionario');
const routeCliente = require('./route/routeCliente');
const routeCategoria = require('./route/routeCategoria');
const routeFornecedor = require('./route/routeFornecedor');
const routeProduto = require('./route/routeProduto');
const routeEstoque = require('./route/routeEstoque');
const routeEntrada = require('./route/routeEntrada');
const routeMovimentacao = require('./route/routeMovimentacao');
const routePedido = require('./route/routePedido');
const routePedidoItem = require('./route/routePedidoItem');
const routeSaida = require('./route/routeSaida');

const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowAnyOrigin = process.env.NODE_ENV !== 'production' && allowedOrigins.length === 0;

// 2. Controle de CORS
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowAnyOrigin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization'
    ]
}));

// 3. Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 4. Página inicial da API
app.get('/', (req, res) => {
    res.type('html').send(`<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>API de Gestão de Loja</title>
    <style>
        body {
            max-width: 760px;
            margin: 0 auto;
            padding: 48px 24px;
            color: #1f2937;
            font: 16px/1.6 system-ui, sans-serif;
        }
        h1 { margin-bottom: 8px; }
        h2 { margin-top: 32px; }
        p { color: #4b5563; }
        ul { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px 24px; padding-left: 20px; }
        a { color: #2563eb; }
        code { color: #111827; }
    </style>
</head>
<body>
    <main>
        <h1>API de Gestão de Loja</h1>
        <p>API para consultar e gerenciar os dados operacionais da loja.</p>
        <p>Os recursos retornam JSON e exigem um token obtido pelo endpoint de login.</p>
        <h2>Recursos disponíveis</h2>
        <ul>
        <li><code>/usuario</code></li>
        <li><code>/funcionario</code></li>
        <li><code>/cliente</code></li>
        <li><code>/categoria</code></li>
        <li><code>/fornecedor</code></li>
        <li><code>/produto</code></li>
        <li><code>/estoque</code></li>
        <li><code>/entrada</code></li>
        <li><code>/saida</code></li>
        <li><code>/movimentacao</code></li>
        <li><code>/pedido</code></li>
        <li><code>/pedido-item</code></li>
        </ul>
    </main>
</body>
</html>`);
});

// 5. Definição das Rotas
app.use('/usuario', routeUsuario);
app.use('/funcionario', authenticate, routeFuncionario);
app.use('/cliente', authenticate, routeCliente);
app.use('/categoria', authenticate, routeCategoria);
app.use('/fornecedor', authenticate, routeFornecedor);
app.use('/produto', authenticate, routeProduto);
app.use('/estoque', authenticate, routeEstoque);
app.use('/entrada', authenticate, routeEntrada);
app.use('/movimentacao', authenticate, routeMovimentacao);
app.use('/pedido', authenticate, routePedido);
app.use('/pedido-item', authenticate, routePedidoItem);
app.use('/saida', authenticate, routeSaida);
// 6. Rota não encontrada
app.use((req, res, next) => {
    const erro = new Error('Não encontrado!');
    erro.status = 404;
    next(erro);
});

// 7. Tratamento de Erros
app.use((error, req, res, next) => {
    const status = error.status || 500;
    if (status >= 500) {
        console.error(error);
    }

    return res.status(status).json({
        erro: {
            mensagem: status >= 500 ? 'Erro interno do servidor.' : error.message
        }
    });
});

module.exports = app;