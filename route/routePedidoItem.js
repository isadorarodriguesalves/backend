const createCrudRouter = require('./crudRouter');

module.exports = createCrudRouter({
    table: 'pedido_itens',
    idField: 'id_item',
    plural: 'itens',
    singular: 'item',
    fields: {
        id_pedido: 'positiveInteger',
        id_produto: 'positiveInteger',
        quantidade: 'positiveInteger',
        valor_unitario: 'number',
        subtotal: 'number'
    }
});
