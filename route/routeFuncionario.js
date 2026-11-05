const express = require('express');
const router = express.Router();
const Funcionario = require('../models').funcionarios;

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
    const funcionarios = await Funcionario.findAll({ raw: true });
    res.status(200).json({ funcionarios });
});

router.get('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const funcionario = await Funcionario.findByPk(req.params.id, { raw: true });
    if (!funcionario) {
        return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });
    }
    res.status(200).json({ funcionarios: funcionario });
});

router.post('/', async (req, res) => {
    const { nome, cargo, salario, telefone = null, email = null, data_admissao = null, ativo = 1 } = req.body || {};
    if (typeof nome !== 'string' || !nome.trim() ||
        typeof cargo !== 'string' || !cargo.trim() ||
        salario === undefined || salario === null || !Number.isFinite(Number(salario))) {
        return res.status(400).json({ mensagem: 'Nome, cargo e salário válido são obrigatórios.' });
    }

    const funcionario = await Funcionario.create({
        nome: nome.trim(),
        cargo: cargo.trim(),
        salario,
        telefone,
        email,
        data_admissao,
        ativo
    });
    res.status(201).json({
        mensagem: 'Funcionário criado com sucesso!',
        id_funcionario: funcionario.id_funcionario
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

    const values = Object.fromEntries(fields.map((field) => [
        funcionarioFields[field],
        typeof body[field] === 'string' ? body[field].trim() : body[field]
    ]));
    await Funcionario.update(values, { where: { id_funcionario: req.params.id } });
    res.status(200).json({ mensagem: 'Funcionário atualizado com sucesso!' });
});

router.delete('/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    const deletedCount = await Funcionario.destroy({ where: { id_funcionario: req.params.id } });
    if (deletedCount === 0) {
        return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });
    }
    res.status(200).json({ mensagem: 'Funcionário removido com sucesso!' });
});

module.exports = router;
