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

// 4. Definição das Rotas
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
// 5. Rota não encontrada
app.use((req, res, next) => {
    const erro = new Error('Não encontrado!');
    erro.status = 404;
    next(erro);
});

// 6. Tratamento de Erros
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