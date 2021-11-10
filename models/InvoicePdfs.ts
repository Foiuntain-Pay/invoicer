/*************************************************************************
ITEMS TABLE
*************************************************************************/

export default function(sequelize: { define: (arg0: string, arg1: { file: { type: any; allowNull: boolean; }; invoiceId: { type: any; allowNull: boolean; }; }, arg2: { freezeTableName: boolean; }) => any; }, Sequelize: { STRING: any; INTEGER: any; }) {
    
    const InvoicePdfs = sequelize.define('invoicePdfs', {
        
        file: {
            type: Sequelize.STRING,
            allowNull: false
        },
        invoiceId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
    }, {
        freezeTableName: true
    });

    InvoicePdfs.associate = function(models: { invoicePdfs: { belongsTo: (arg0: any, arg1: { onDelete: string; targetKey: string; foreignKey: string; }) => void; }; invoices: any; }) {
        models.invoicePdfs.belongsTo(models.invoices, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'invoiceId'});
    };

    return InvoicePdfs;

}