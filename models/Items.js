/*************************************************************************
ITEMS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    
    const Items = sequelize.define('items', {
        
        Description: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'description',
        },
        Qty: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'qty'
        },
        Rate: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'rate'
        },
        Amount: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'field'
        },
        InvoiceId: {
            type: Sequelize.INTEGER,
            field: 'invoiceId'
        },
    }, {
        freezeTableName: true
    });

    Items.associate = function(models) {
        models.items.belongsTo(models.invoices, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'invoiceId'});
    };

    return Items;

}