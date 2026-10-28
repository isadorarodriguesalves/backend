const express = require('express');
const router = express.Router();
const { query } = require('./database');
const bcrypt = require('bcryptjs');

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

    const usuarios = await query(
        `SELECT id_usu, nome, email, senha, contato, genero, ativo
         FROM usuarios WHERE email = ?`,
        [email.trim()]
    );
    if (usuarios.length === 0 || Number(usuarios[0].ativo) !== 1) {
        return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
    }

    const usuario = usuarios[0];
    const bcryptHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(usuario.senha);
    const senhaValida = bcryptHash
        ? await bcrypt.compare(senha, usuario.senha)
        : !usuario.senha.startsWith('$2') && senha === usuario.senha;
    if (!senhaValida) {
        return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
    }

    if (!bcryptHash) {
        const senhaHash = await bcrypt.hash(senha, 10);
        await query('UPDATE usuarios SET senha = ? WHERE id_usu = ? AND senha = ?', [
            senhaHash,
            usuario.id_usu,
            usuario.senha
        ]);
    }

    delete usuario.senha;
    res.status(200).json({
        mensagem: 'Login realizado com sucesso!',
        usuario
    });
});

router.get('/', async (req, res) => {
    const usuarios = await query(
        `SELECT id_usu, nome, email, contato, genero, ativo, criado_em, atualizado_em
         FROM usuarios`
    );
    res.status(200).json({ usuarios });
});

router.get('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const usuarios = await query(
        `SELECT id_usu, nome, email, contato, genero, ativo, criado_em, atualizado_em
         FROM usuarios WHERE id_usu = ?`,
        [req.params.id]
    );
    if (usuarios.length === 0) {
        return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }
    res.status(200).json({ usuario: usuarios[0] });
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
    const resultado = await query(
        `INSERT INTO usuarios (nome, email, senha, contato, genero, ativo)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nome.trim(), email.trim(), senhaHash, contato, genero, ativo]
    );
    res.status(201).json({
        mensagem: 'Usuário criado com sucesso!',
        id_usu: resultado.insertId
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

    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = await Promise.all(fields.map(async (field) => {
        if (field === 'senha') {
            return bcrypt.hash(body[field], 10);
        }
        return typeof body[field] === 'string' ? body[field].trim() : body[field];
    }));
    await query(
        `UPDATE usuarios SET ${assignments} WHERE id_usu = ?`,
        [...values, req.params.id]
    );
    res.status(200).json({ mensagem: 'Usuário atualizado com sucesso!' });
});

router.delete('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const resultado = await query('DELETE FROM usuarios WHERE id_usu = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }
    res.status(200).json({ mensagem: 'Usuário removido com sucesso!' });
});

module.exports = router;
