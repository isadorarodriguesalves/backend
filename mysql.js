const { Sequelize } = require('sequelize');

const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);
if (missingVariables.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missingVariables.join(', ')}`);
}

const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
    throw new Error('DB_PORT deve ser um número inteiro entre 1 e 65535.');
}

const dbSslValue = (process.env.DB_SSL || 'false').toLowerCase();
if (!['true', 'false'].includes(dbSslValue)) {
    throw new Error('DB_SSL deve ser true ou false.');
}

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: dbPort,
        dialect: 'mysql',
        logging: false,
        dialectOptions: dbSslValue === 'true' ? {
            ssl: {
                rejectUnauthorized: true
            }
        } : {},
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = { sequelize };
