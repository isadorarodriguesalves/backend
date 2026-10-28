const createCrudRouter = require('./crudRouter');

module.exports = createCrudRouter({
    table: 'estoque',
    idField: 'id_estoque',
    plural: 'estoque',
    singular: 'estoque',
    fields: {
        id_produto: 'positiveInteger',
        quantidade: 'integer',
        estoque_minimo: 'integer',
        estoque_maximo: 'integer',
        localizacao: 'string'
    },
    required: ['id_produto', 'quantidade']
});
