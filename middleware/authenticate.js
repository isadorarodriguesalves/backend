const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;
if (typeof jwtSecret !== 'string' || Buffer.byteLength(jwtSecret, 'utf8') < 32) {
    throw new Error('JWT_SECRET é obrigatória e deve ter pelo menos 32 bytes.');
}

function authenticate(req, res, next) {
    const authorization = req.get('authorization') || '';
    const match = authorization.match(/^Bearer\s+(\S+)$/i);
    if (!match) {
        return res.status(401).json({ mensagem: 'Autenticação obrigatória.' });
    }

    try {
        const claims = jwt.verify(match[1], jwtSecret, {
            algorithms: ['HS256'],
            audience: 'loja-api',
            issuer: 'loja-api'
        });
        if (typeof claims === 'string' || typeof claims.sub !== 'string') {
            return res.status(401).json({ mensagem: 'Token de autenticação inválido.' });
        }
        req.auth = claims;
        return next();
    } catch (error) {
        if (!(error instanceof jwt.JsonWebTokenError)) {
            return next(error);
        }
        return res.status(401).json({ mensagem: 'Token de autenticação inválido ou expirado.' });
    }
}

module.exports = authenticate;
