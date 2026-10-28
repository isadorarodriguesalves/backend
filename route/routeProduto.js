const createCrudRouter = require('./crudRouter');

module.exports = createCrudRouter({
    table: 'produtos',
    idField: 'id_produto',
    plural: 'produtos',
    singular: 'produto',
    fields: {
        nome: 'string',
        descricao: 'string',
        preco: 'number',
        imagem_produto: 'string',
        id_categoria: 'integer'
    },
    required: ['descricao', 'imagem_produto']
});
