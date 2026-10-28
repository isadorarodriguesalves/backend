const createCrudRouter = require('./crudRouter');

module.exports = createCrudRouter({
    table: 'entradas',
    idField: 'id_entrada',
    plural: 'entradas',
    singular: 'entrada',
    fields: {
        id_produto: 'positiveInteger',
        id_fornecedor: 'positiveInteger',
        quantidade: 'positiveInteger',
        valor_unitario: 'number',
        data_entrada: 'string',
        observacao: 'string'
    },
    required: ['id_produto', 'id_fornecedor', 'quantidade', 'valor_unitario']
});
