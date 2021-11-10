/*************************************************************************
ITEMS TABLE
*************************************************************************/

export default function(sequelize: { define: (arg0: string, arg1: { productId: { type: any; allowNull: boolean; }; qty: { type: any; allowNull: boolean; }; amount: { type: any; allowNull: boolean; }; invoiceId: { type: any; allowNull: boolean; }; }, arg2: { freezeTableName: boolean; }) => any; }, Sequelize: { INTEGER: any; }) {
    
    const Items = sequelize.define('items', {
        
        productId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        qty: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        amount: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        invoiceId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
    }, {
        freezeTableName: true
    });

    Items.associate = function(models: { items: { belongsTo: (arg0: any, arg1: { onDelete: string; targetKey: string; foreignKey: string; }) => void; }; invoices: any; products: any; }) {
        models.items.belongsTo(models.invoices, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'invoiceId'});
        models.items.belongsTo(models.products, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'productId'});
    };

    return Items;

}