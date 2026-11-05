const express = require('express');
const models = require('../models');

function validId(value) {
    return /^\d+$/.test(value) && Number(value) > 0;
}

function validValue(type, value) {
    if (value === null) {
        return true;
    }

    switch (type) {
    case 'string':
        return typeof value === 'string';
    case 'integer':
        return Number.isInteger(Number(value)) && Number(value) >= 0;
    case 'positiveInteger':
        return Number.isInteger(Number(value)) && Number(value) > 0;
    case 'number':
        return Number.isFinite(Number(value)) && Number(value) >= 0;
    case 'boolean':
        return [0, 1, false, true, '0', '1'].includes(value);
    case 'movementType':
        return ['E', 'S', 'A', 'P', 'T'].includes(value);
    default:
        return false;
    }
}

function createCrudRouter({ table, idField, plural, singular, fields, required = [] }) {
    const router = express.Router();
    const model = models[table];
    const fieldNames = Object.keys(fields);

    function validateFields(body, names) {
        return names.every((name) =>
            validValue(fields[name], body[name]) &&
            (!required.includes(name) || (body[name] !== null && body[name] !== ''))
        );
    }

    router.get('/', async (req, res) => {
        const records = await model.findAll({ raw: true });
        res.status(200).json({ [plural]: records });
    });

    router.get('/:id', async (req, res) => {
        if (!validId(req.params.id)) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }

        const record = await model.findByPk(req.params.id, { raw: true });
        if (!record) {
            return res.status(404).json({ mensagem: `${singular} não encontrado(a).` });
        }
        res.status(200).json({ [singular]: record });
    });

    router.post('/', async (req, res) => {
        const body = req.body || {};
        const names = fieldNames.filter((name) =>
            Object.prototype.hasOwnProperty.call(body, name)
        );
        if (!required.every((name) => names.includes(name))) {
            return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' });
        }
        if (!validateFields(body, names)) {
            return res.status(400).json({ mensagem: 'Um ou mais campos são inválidos.' });
        }

        const record = await model.create(
            Object.fromEntries(names.map((name) => [name, body[name]]))
        );
        res.status(201).json({
            mensagem: `${singular} criado(a) com sucesso!`,
            [idField]: record.get(idField)
        });
    });

    router.patch('/:id', async (req, res) => {
        if (!validId(req.params.id)) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }

        const body = req.body || {};
        const names = fieldNames.filter((name) =>
            Object.prototype.hasOwnProperty.call(body, name)
        );
        if (names.length === 0) {
            return res.status(400).json({ mensagem: 'Informe ao menos um campo para atualizar.' });
        }
        if (!validateFields(body, names)) {
            return res.status(400).json({ mensagem: 'Um ou mais campos são inválidos.' });
        }

        await model.update(
            Object.fromEntries(names.map((name) => [name, body[name]])),
            { where: { [idField]: req.params.id } }
        );
        res.status(200).json({ mensagem: `${singular} atualizado(a) com sucesso!` });
    });

    router.delete('/:id', async (req, res) => {
        if (!validId(req.params.id)) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }

        const deletedCount = await model.destroy({ where: { [idField]: req.params.id } });
        if (deletedCount === 0) {
            return res.status(404).json({ mensagem: `${singular} não encontrado(a).` });
        }
        res.status(200).json({ mensagem: `${singular} removido(a) com sucesso!` });
    });

    return router;
}

module.exports = createCrudRouter;
