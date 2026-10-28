const createCrudRouter = require('./crudRouter');

module.exports = createCrudRouter({
    table: 'pedidos',
    idField: 'id_pedido',
    plural: 'pedidos',
    singular: 'pedido',
    fields: {
        status: 'boolean',
        data_pedido: 'string',
        id_cliente: 'positiveInteger'
    }
});
