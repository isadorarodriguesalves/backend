// 1. Dependências e Middlewares
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

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
        <p>Os recursos abaixo retornam respostas em JSON.</p>
        <h2>Recursos disponíveis</h2>
        <ul>
            <li><a href="/usuario"><code>/usuario</code></a></li>
            <li><a href="/funcionario"><code>/funcionario</code></a></li>
            <li><a href="/cliente"><code>/cliente</code></a></li>
            <li><a href="/categoria"><code>/categoria</code></a></li>
            <li><a href="/fornecedor"><code>/fornecedor</code></a></li>
            <li><a href="/produto"><code>/produto</code></a></li>
            <li><a href="/estoque"><code>/estoque</code></a></li>
            <li><a href="/entrada"><code>/entrada</code></a></li>
            <li><a href="/saida"><code>/saida</code></a></li>
            <li><a href="/movimentacao"><code>/movimentacao</code></a></li>
            <li><a href="/pedido"><code>/pedido</code></a></li>
            <li><a href="/pedido-item"><code>/pedido-item</code></a></li>
        </ul>
    </main>
</body>
</html>`);
});

// 5. Definição das Rotas
app.use('/usuario', routeUsuario);
app.use('/funcionario', routeFuncionario);
app.use('/cliente', routeCliente);
app.use('/categoria', routeCategoria);
app.use('/fornecedor', routeFornecedor);
app.use('/produto', routeProduto);
app.use('/estoque', routeEstoque);
app.use('/entrada', routeEntrada);
app.use('/movimentacao', routeMovimentacao);
app.use('/pedido', routePedido);
app.use('/pedido-item', routePedidoItem);
app.use('/saida', routeSaida);
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