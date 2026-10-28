const createCrudRouter = require('./crudRouter');

module.exports = createCrudRouter({
    table: 'saidas',
    idField: 'id_saida',
    plural: 'saidas',
    singular: 'saida',
    fields: {
        id_produto: 'positiveInteger',
        id_funcionario: 'positiveInteger',
        quantidade: 'positiveInteger',
        valor_unitario: 'number',
        data_saida: 'string',
        destino: 'string'
    },
    required: ['id_produto', 'id_funcionario', 'quantidade', 'valor_unitario']
});
