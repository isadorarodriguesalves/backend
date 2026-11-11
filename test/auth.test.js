process.env.DB_HOST = '127.0.0.1';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test';
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

const assert = require('node:assert/strict');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const { after, test } = require('node:test');
const app = require('../app');
const authenticate = require('../middleware/authenticate');

const server = http.createServer(app);
let baseUrl;

const serverReady = new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
    });
});

after(async () => {
    await serverReady;
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

test('homepage remains public and serves HTML', async () => {
    await serverReady;
    const response = await fetch(`${baseUrl}/`);

    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.match(await response.text(), /API de Gestão de Loja/);
});

test('data routes require authentication', async () => {
    await serverReady;
    const paths = [
        '/usuario',
        '/funcionario',
        '/cliente',
        '/categoria',
        '/fornecedor',
        '/produto',
        '/estoque',
        '/entrada',
        '/movimentacao',
        '/pedido',
        '/pedido-item',
        '/saida'
    ];

    for (const path of paths) {
        const response = await fetch(`${baseUrl}${path}`);
        assert.equal(response.status, 401, `${path} should require authentication`);
    }

    const invalidTokenResponse = await fetch(`${baseUrl}/produto`, {
        headers: { authorization: 'Bearer invalid-token' }
    });
    assert.equal(invalidTokenResponse.status, 401);
});

test('login remains public and validates required fields', async () => {
    await serverReady;
    const response = await fetch(`${baseUrl}/usuario/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({})
    });

    assert.equal(response.status, 400);
});

test('authentication middleware accepts a valid token', () => {
    const token = jwt.sign(
        { email: 'test@example.com' },
        process.env.JWT_SECRET,
        {
            algorithm: 'HS256',
            audience: 'loja-api',
            expiresIn: '1h',
            issuer: 'loja-api',
            subject: '1'
        }
    );
    const request = { get: () => `Bearer ${token}` };
    const response = createResponse();
    let nextCalled = false;

    authenticate(request, response, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(request.auth.sub, '1');
});

test('authentication middleware rejects an expired token', () => {
    const token = jwt.sign(
        { email: 'test@example.com' },
        process.env.JWT_SECRET,
        {
            algorithm: 'HS256',
            audience: 'loja-api',
            expiresIn: -1,
            issuer: 'loja-api',
            subject: '1'
        }
    );
    const response = createResponse();
    let nextCalled = false;

    authenticate({ get: () => `Bearer ${token}` }, response, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(response.statusCode, 401);
});

function createResponse() {
    return {
        statusCode: 0,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}
