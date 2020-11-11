/*************************************************************************
ITEMS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    
    const InvoicePdfs = sequelize.define('invoicePdfs', {
        
        File: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'file',
        },
        InvoiceId: {
            type: Sequelize.INTEGER,
            field: 'invoiceId'
        },
    }, {
        freezeTableName: true
    });

    InvoicePdfs.associate = function(models) {
        models.invoicePdfs.belongsTo(models.invoices, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'invoiceId'});
    };

    return InvoicePdfs;

}