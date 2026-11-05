const { DataTypes } = require('sequelize');
const { sequelize } = require('../mysql');

function defineModel(tableName, primaryKey, fields, timestamps = false) {
    return sequelize.define(tableName, {
        [primaryKey]: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ...fields
    }, {
        tableName,
        freezeTableName: true,
        timestamps,
        createdAt: timestamps ? 'criado_em' : false,
        updatedAt: timestamps ? 'atualizado_em' : false
    });
}

const models = {
    categorias: defineModel('categorias', 'id_categoria', {
        nome: { type: DataTypes.STRING(100), allowNull: false },
        descricao: { type: DataTypes.TEXT },
        ativo: { type: DataTypes.BOOLEAN, defaultValue: 1 }
    }),
    clientes: defineModel('clientes', 'id_cliente', {
        nome: { type: DataTypes.STRING(100), allowNull: false },
        email: { type: DataTypes.STRING(100), allowNull: false },
        contato: { type: DataTypes.STRING(20) },
        ativo: { type: DataTypes.BOOLEAN, defaultValue: 1 }
    }, true),
    entradas: defineModel('entradas', 'id_entrada', {
        id_produto: { type: DataTypes.INTEGER, allowNull: false },
        id_fornecedor: { type: DataTypes.INTEGER, allowNull: false },
        quantidade: { type: DataTypes.INTEGER, allowNull: false },
        valor_unitario: { type: DataTypes.DOUBLE(10, 2), allowNull: false },
        data_entrada: { type: DataTypes.DATEONLY },
        observacao: { type: DataTypes.STRING(200) }
    }, true),
    estoque: defineModel('estoque', 'id_estoque', {
        id_produto: { type: DataTypes.INTEGER, allowNull: false },
        quantidade: { type: DataTypes.INTEGER, allowNull: false },
        estoque_minimo: { type: DataTypes.INTEGER },
        estoque_maximo: { type: DataTypes.INTEGER },
        localizacao: { type: DataTypes.STRING(100) }
    }),
    fornecedores: defineModel('fornecedores', 'id_fornecedor', {
        nome: { type: DataTypes.STRING(100), allowNull: false },
        empresa: { type: DataTypes.STRING(100) },
        email: { type: DataTypes.STRING(100) },
        telefone: { type: DataTypes.STRING(20) },
        cidade: { type: DataTypes.STRING(50) },
        estado: { type: DataTypes.STRING(2) },
        ativo: { type: DataTypes.BOOLEAN, defaultValue: 1 }
    }, true),
    funcionarios: defineModel('funcionarios', 'id_funcionario', {
        nome: { type: DataTypes.STRING(100), allowNull: false },
        cargo: { type: DataTypes.STRING(50), allowNull: false },
        salario: { type: DataTypes.DOUBLE(10, 2), allowNull: false },
        telefone: { type: DataTypes.STRING(20) },
        email: { type: DataTypes.STRING(100) },
        data_admissao: { type: DataTypes.DATEONLY },
        ativo: { type: DataTypes.BOOLEAN, defaultValue: 1 }
    }, true),
    movimentacoes: defineModel('movimentacoes', 'id_movimentacao', {
        id_produto: { type: DataTypes.INTEGER },
        tipo: { type: DataTypes.ENUM('E', 'S', 'A', 'P', 'T') },
        quantidade: { type: DataTypes.INTEGER },
        data_movimentacao: { type: DataTypes.DATE },
        observacao: { type: DataTypes.TEXT }
    }),
    pedidos: defineModel('pedidos', 'id_pedido', {
        status: { type: DataTypes.BOOLEAN, defaultValue: 1 },
        data_pedido: { type: DataTypes.DATEONLY },
        id_cliente: { type: DataTypes.INTEGER }
    }, true),
    pedido_itens: defineModel('pedido_itens', 'id_item', {
        id_pedido: { type: DataTypes.INTEGER },
        id_produto: { type: DataTypes.INTEGER },
        quantidade: { type: DataTypes.INTEGER },
        valor_unitario: { type: DataTypes.DECIMAL(10, 2) },
        subtotal: { type: DataTypes.DECIMAL(10, 2) }
    }),
    produtos: defineModel('produtos', 'id_produto', {
        nome: { type: DataTypes.STRING(100) },
        descricao: { type: DataTypes.STRING(200), allowNull: false },
        preco: { type: DataTypes.DECIMAL(10, 2) },
        imagem_produto: { type: DataTypes.STRING(255), allowNull: false },
        id_categoria: { type: DataTypes.INTEGER }
    }, true),
    saidas: defineModel('saidas', 'id_saida', {
        id_produto: { type: DataTypes.INTEGER, allowNull: false },
        id_funcionario: { type: DataTypes.INTEGER, allowNull: false },
        quantidade: { type: DataTypes.INTEGER, allowNull: false },
        valor_unitario: { type: DataTypes.DOUBLE(10, 2), allowNull: false },
        data_saida: { type: DataTypes.DATEONLY },
        destino: { type: DataTypes.STRING(100) }
    }, true),
    usuarios: defineModel('usuarios', 'id_usu', {
        nome: { type: DataTypes.STRING(80), allowNull: false },
        email: { type: DataTypes.STRING(100), allowNull: false },
        senha: { type: DataTypes.STRING(255), allowNull: false },
        contato: { type: DataTypes.STRING(20) },
        genero: { type: DataTypes.STRING(1) },
        ativo: { type: DataTypes.BOOLEAN, defaultValue: 1 }
    }, true)
};

module.exports = models;
