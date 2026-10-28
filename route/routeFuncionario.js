const express = require('express');
const router = express.Router();
const { query } = require('./database');

const funcionarioFields = {
    nome: 'nome',
    cargo: 'cargo',
    salario: 'salario',
    telefone: 'telefone',
    email: 'email',
    data_admissao: 'data_admissao',
    ativo: 'ativo'
};

function validId(value) {
    return /^\d+$/.test(value) && Number(value) > 0;
}

router.get('/', async (req, res) => {
    const funcionarios = await query('SELECT * FROM funcionarios');
    res.status(200).json({ funcionarios });
});

router.get('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const funcionarios = await query(
        'SELECT * FROM funcionarios WHERE id_funcionario = ?',
        [req.params.id]
    );
    if (funcionarios.length === 0) {
        return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });
    }
    res.status(200).json({ funcionarios: funcionarios[0] });
});

router.post('/', async (req, res) => {
    const { nome, cargo, salario, telefone = null, email = null, data_admissao = null, ativo = 1 } = req.body || {};
    if (typeof nome !== 'string' || !nome.trim() ||
        typeof cargo !== 'string' || !cargo.trim() ||
        salario === undefined || salario === null || !Number.isFinite(Number(salario))) {
        return res.status(400).json({ mensagem: 'Nome, cargo e salário válido são obrigatórios.' });
    }

    const resultado = await query(
        `INSERT INTO funcionarios
         (nome, cargo, salario, telefone, email, data_admissao, ativo)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nome.trim(), cargo.trim(), salario, telefone, email, data_admissao, ativo]
    );
    res.status(201).json({
        mensagem: 'Funcionário criado com sucesso!',
        id_funcionario: resultado.insertId
    });
});

router.patch('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const body = req.body || {};
    const fields = Object.keys(funcionarioFields)
        .filter((field) => Object.prototype.hasOwnProperty.call(body, field));
    if (fields.length === 0) {
        return res.status(400).json({ mensagem: 'Informe ao menos um campo para atualizar.' });
    }
    if (fields.some((field) =>
        (field === 'nome' || field === 'cargo') &&
        (typeof body[field] !== 'string' || !body[field].trim())
    )) {
        return res.status(400).json({ mensagem: 'Nome e cargo não podem ficar vazios.' });
    }
    if (fields.includes('salario') &&
        (body.salario === null || !Number.isFinite(Number(body.salario)))) {
        return res.status(400).json({ mensagem: 'Salário inválido.' });
    }

    const assignments = fields.map((field) => `${funcionarioFields[field]} = ?`).join(', ');
    const values = fields.map((field) =>
        typeof body[field] === 'string' ? body[field].trim() : body[field]
    );
    values.push(req.params.id);
    await query(`UPDATE funcionarios SET ${assignments} WHERE id_funcionario = ?`, values);
    res.status(200).json({ mensagem: 'Funcionário atualizado com sucesso!' });
});

router.delete('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const resultado = await query(
        'DELETE FROM funcionarios WHERE id_funcionario = ?',
        [req.params.id]
    );
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });
    }
    res.status(200).json({ mensagem: 'Funcionário removido com sucesso!' });
});

module.exports = router;
