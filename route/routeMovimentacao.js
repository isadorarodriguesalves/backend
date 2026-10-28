const createCrudRouter = require('./crudRouter');

module.exports = createCrudRouter({
    table: 'movimentacoes',
    idField: 'id_movimentacao',
    plural: 'movimentacoes',
    singular: 'movimentacao',
    fields: {
        id_produto: 'positiveInteger',
        tipo: 'movementType',
        quantidade: 'integer',
        data_movimentacao: 'string',
        observacao: 'string'
    }
});
