const express = require('express');
const router = express.Router();
const Cliente = require('../models').clientes;

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
    const clientes = await Cliente.findAll({
        attributes: ['id_cliente', 'nome', 'email', 'contato', 'ativo', 'criado_em', 'atualizado_em'],
        raw: true
    });
    res.status(200).json({ clientes });
});

router.get('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const cliente = await Cliente.findByPk(req.params.id, {
        attributes: ['id_cliente', 'nome', 'email', 'contato', 'ativo', 'criado_em', 'atualizado_em'],
        raw: true
    });
    if (!cliente) {
        return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
    }
    res.status(200).json({ cliente });
});

router.post('/', async (req, res) => {
    const { nome, email, contato = null, ativo = 1 } = req.body || {};
    if (typeof nome !== 'string' || !nome.trim() || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ mensagem: 'Nome e email são obrigatórios.' });
    }

    const cliente = await Cliente.create({ nome: nome.trim(), email: email.trim(), contato, ativo });
    res.status(201).json({
        mensagem: 'Cliente criado com sucesso!',
        id_cliente: cliente.id_cliente
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

    const values = Object.fromEntries(fields.map((field) => [
        clienteFields[field],
        typeof body[field] === 'string' ? body[field].trim() : body[field]
    ]));
    await Cliente.update(values, { where: { id_cliente: req.params.id } });
    res.status(200).json({ mensagem: 'Cliente atualizado com sucesso!' });
});

router.delete('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const deletedCount = await Cliente.destroy({ where: { id_cliente: req.params.id } });
    if (deletedCount === 0) {
        return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
    }
    res.status(200).json({ mensagem: 'Cliente removido com sucesso!' });
});

module.exports = router;
