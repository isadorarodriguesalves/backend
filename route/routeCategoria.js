const createCrudRouter = require('./crudRouter');

module.exports = createCrudRouter({
    table: 'categorias',
    idField: 'id_categoria',
    plural: 'categorias',
    singular: 'categoria',
    fields: {
        nome: 'string',
        descricao: 'string',
        ativo: 'boolean'
    },
    required: ['nome']
});
