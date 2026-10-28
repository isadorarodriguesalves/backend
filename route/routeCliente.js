const express = require('express');
const router = express.Router();
const { query } = require('./database');

const clienteFields = {
    nome: 'nome',
    email: 'email',
    contato: 'contato',
    ativo: 'ativo'
};

function validId(value) {
    return /^\d+$/.test(value) && Number(value) > 0;
}

router.get('/', async (req, res) => {
    const clientes = await query(
        `SELECT id_cliente, nome, email, contato, ativo, criado_em, atualizado_em
         FROM clientes`
    );
    res.status(200).json({ clientes });
});

router.get('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const clientes = await query(
        `SELECT id_cliente, nome, email, contato, ativo, criado_em, atualizado_em
         FROM clientes WHERE id_cliente = ?`,
        [req.params.id]
    );
    if (clientes.length === 0) {
        return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
    }
    res.status(200).json({ cliente: clientes[0] });
});

router.post('/', async (req, res) => {
    const { nome, email, contato = null, ativo = 1 } = req.body || {};
    if (typeof nome !== 'string' || !nome.trim() || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ mensagem: 'Nome e email são obrigatórios.' });
    }

    const resultado = await query(
        'INSERT INTO clientes (nome, email, contato, ativo) VALUES (?, ?, ?, ?)',
        [nome.trim(), email.trim(), contato, ativo]
    );
    res.status(201).json({
        mensagem: 'Cliente criado com sucesso!',
        id_cliente: resultado.insertId
    });
});

router.patch('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const body = req.body || {};
    const fields = Object.keys(clienteFields)
        .filter((field) => Object.prototype.hasOwnProperty.call(body, field));
    if (fields.length === 0) {
        return res.status(400).json({ mensagem: 'Informe ao menos um campo para atualizar.' });
    }
    if (fields.some((field) =>
        (field === 'nome' || field === 'email') &&
        (typeof body[field] !== 'string' || !body[field].trim())
    )) {
        return res.status(400).json({ mensagem: 'Nome e email não podem ficar vazios.' });
    }

    const assignments = fields.map((field) => `${clienteFields[field]} = ?`).join(', ');
    const values = fields.map((field) =>
        typeof body[field] === 'string' ? body[field].trim() : body[field]
    );
    values.push(req.params.id);
    await query(`UPDATE clientes SET ${assignments} WHERE id_cliente = ?`, values);
    res.status(200).json({ mensagem: 'Cliente atualizado com sucesso!' });
});

router.delete('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const resultado = await query('DELETE FROM clientes WHERE id_cliente = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
    }
    res.status(200).json({ mensagem: 'Cliente removido com sucesso!' });
});

module.exports = router;
