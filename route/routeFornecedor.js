const createCrudRouter = require('./crudRouter');

module.exports = createCrudRouter({
    table: 'fornecedores',
    idField: 'id_fornecedor',
    plural: 'fornecedores',
    singular: 'fornecedor',
    fields: {
        nome: 'string',
        empresa: 'string',
        email: 'string',
        telefone: 'string',
        cidade: 'string',
        estado: 'string',
        ativo: 'boolean'
    },
    required: ['nome']
});
