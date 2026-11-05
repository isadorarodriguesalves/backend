require('dotenv').config();
const http = require('http');
const app = require('./app');
const { sequelize } = require('./mysql');
const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const server = http.createServer(app);
let isShuttingDown = false;

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um número inteiro entre 1 e 65535.');
}

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Conexão estabelecida!');

        await new Promise((resolve, reject) => {
            const onError = (error) => reject(error);
            server.once('error', onError);
            server.listen(port, '0.0.0.0', () => {
                server.off('error', onError);
                resolve();
            });
        });

        console.log(`Servidor rodando na porta ${port}`);
        process.once('SIGINT', () => stopServer('SIGINT'));
        process.once('SIGTERM', () => stopServer('SIGTERM'));
    } catch (error) {
        console.error('Não foi possível iniciar o servidor:', error);
        try {
            await sequelize.close();
        } catch (closeError) {
            console.error('Erro ao encerrar a conexão com o MySQL:', closeError);
        }
        process.exitCode = 1;
    }
}

function stopServer(signal) {
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;
    console.log(`Sinal ${signal} recebido; encerrando o servidor.`);
    server.close(async (error) => {
        if (error) {
            console.error('Erro ao encerrar o servidor HTTP:', error);
            process.exitCode = 1;
        }

        try {
            await sequelize.close();
        } catch (closeError) {
            console.error('Erro ao encerrar a conexão com o MySQL:', closeError);
            process.exitCode = 1;
        }
    });
}

startServer();
