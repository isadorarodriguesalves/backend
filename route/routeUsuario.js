const express = require('express');
const router = express.Router();
const Usuario = require('../models').usuarios;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');

const userFields = {
    nome: 'string',
    email: 'string',
    senha: 'string',
    contato: 'string',
    genero: 'string',
    ativo: 'boolean'
};

function validId(value) {
    return /^\d+$/.test(value) && Number(value) > 0;
}

function validField(field, value) {
    if (value === null) {
        return field === 'contato' || field === 'genero';
    }
    if (field === 'ativo') {
        return [0, 1, false, true, '0', '1'].includes(value);
    }
    return typeof value === 'string' &&
        (field === 'contato' || field === 'genero' || value.trim().length > 0);
}

router.post('/login', async (req, res) => {
    const { email, senha } = req.body || {};
    if (typeof email !== 'string' || !email.trim() ||
        typeof senha !== 'string' || !senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }

    const usuario = await Usuario.findOne({
        attributes: ['id_usu', 'nome', 'email', 'senha', 'contato', 'genero', 'ativo'],
        where: { email: email.trim() },
        raw: true
    });
    if (!usuario || Number(usuario.ativo) !== 1) {
        return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
    }

    const bcryptHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(usuario.senha);
    const senhaValida = bcryptHash
        ? await bcrypt.compare(senha, usuario.senha)
        : !usuario.senha.startsWith('$2') && senha === usuario.senha;
    if (!senhaValida) {
        return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
    }

    if (!bcryptHash) {
        const senhaHash = await bcrypt.hash(senha, 10);
        await Usuario.update(
            { senha: senhaHash },
            { where: { id_usu: usuario.id_usu, senha: usuario.senha } }
        );
    }

    delete usuario.senha;
    res.status(200).json({
        mensagem: 'Login realizado com sucesso!',
        usuario,
        token: jwt.sign(
            { email: usuario.email },
            process.env.JWT_SECRET,
            {
                algorithm: 'HS256',
                audience: 'loja-api',
                expiresIn: '1h',
                issuer: 'loja-api',
                subject: String(usuario.id_usu)
            }
        ),
        expiresIn: 3600
    });
});

router.use(authenticate);

router.get('/', async (req, res) => {
    const usuarios = await Usuario.findAll({
        attributes: ['id_usu', 'nome', 'email', 'contato', 'genero', 'ativo', 'criado_em', 'atualizado_em'],
        raw: true
    });
    res.status(200).json({ usuarios });
});

router.get('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const usuario = await Usuario.findByPk(req.params.id, {
        attributes: ['id_usu', 'nome', 'email', 'contato', 'genero', 'ativo', 'criado_em', 'atualizado_em'],
        raw: true
    });
    if (!usuario) {
        return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }
    res.status(200).json({ usuario });
});

router.post('/', async (req, res) => {
    const { nome, email, senha, contato = null, genero = null, ativo = 1 } = req.body || {};
    if (typeof nome !== 'string' || !nome.trim() ||
        typeof email !== 'string' || !email.trim() ||
        typeof senha !== 'string' || !senha) {
        return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios.' });
    }
    if (!validField('contato', contato) || !validField('genero', genero) ||
        !validField('ativo', ativo)) {
        return res.status(400).json({ mensagem: 'Um ou mais campos são inválidos.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await Usuario.create({
        nome: nome.trim(),
        email: email.trim(),
        senha: senhaHash,
        contato,
        genero,
        ativo
    });
    res.status(201).json({
        mensagem: 'Usuário criado com sucesso!',
        id_usu: usuario.id_usu
    });
});

router.patch('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const body = req.body || {};
    const fields = Object.keys(userFields).filter((field) =>
        Object.prototype.hasOwnProperty.call(body, field)
    );
    if (fields.length === 0) {
        return res.status(400).json({ mensagem: 'Informe ao menos um campo para atualizar.' });
    }
    if (!fields.every((field) => validField(field, body[field]))) {
        return res.status(400).json({ mensagem: 'Um ou mais campos são inválidos.' });
    }

    const values = Object.fromEntries(await Promise.all(fields.map(async (field) => {
        if (field === 'senha') {
            return [field, await bcrypt.hash(body[field], 10)];
        }
        return [field, typeof body[field] === 'string' ? body[field].trim() : body[field]];
    })));
    await Usuario.update(values, { where: { id_usu: req.params.id } });
    res.status(200).json({ mensagem: 'Usuário atualizado com sucesso!' });
});

router.delete('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const deletedCount = await Usuario.destroy({ where: { id_usu: req.params.id } });
    if (deletedCount === 0) {
        return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }
    res.status(200).json({ mensagem: 'Usuário removido com sucesso!' });
});

module.exports = router;
