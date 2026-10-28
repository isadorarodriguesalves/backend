const express = require('express');
const { query } = require('./database');

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
    const fieldNames = Object.keys(fields);

    function validateFields(body, names) {
        return names.every((name) =>
            validValue(fields[name], body[name]) &&
            (!required.includes(name) || (body[name] !== null && body[name] !== ''))
        );
    }

    router.get('/', async (req, res) => {
        const records = await query(`SELECT * FROM ${table}`);
        res.status(200).json({ [plural]: records });
    });

    router.get('/:id', async (req, res) => {
        if (!validId(req.params.id)) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }

        const records = await query(
            `SELECT * FROM ${table} WHERE ${idField} = ?`,
            [req.params.id]
        );
        if (records.length === 0) {
            return res.status(404).json({ mensagem: `${singular} não encontrado(a).` });
        }
        res.status(200).json({ [singular]: records[0] });
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

        const statement = names.length
            ? `INSERT INTO ${table} (${names.join(', ')}) VALUES (${names.map(() => '?').join(', ')})`
            : `INSERT INTO ${table} () VALUES ()`;
        const result = await query(
            statement,
            names.map((name) => body[name])
        );
        res.status(201).json({
            mensagem: `${singular} criado(a) com sucesso!`,
            [idField]: result.insertId
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

        const assignments = names.map((name) => `${name} = ?`).join(', ');
        await query(
            `UPDATE ${table} SET ${assignments} WHERE ${idField} = ?`,
            [...names.map((name) => body[name]), req.params.id]
        );
        res.status(200).json({ mensagem: `${singular} atualizado(a) com sucesso!` });
    });

    router.delete('/:id', async (req, res) => {
        if (!validId(req.params.id)) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }

        const result = await query(`DELETE FROM ${table} WHERE ${idField} = ?`, [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensagem: `${singular} não encontrado(a).` });
        }
        res.status(200).json({ mensagem: `${singular} removido(a) com sucesso!` });
    });

    return router;
}

module.exports = createCrudRouter;
