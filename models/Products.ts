/*************************************************************************
PRODUCTS TABLE
*************************************************************************/

export default function(sequelize: { define: (arg0: string, arg1: { name: { type: any; allowNull: boolean; }; description: { type: any; }; amount: { type: any; allowNull: boolean; }; status: { type: any; defaultValue: string; }; businessId: { type: any; allowNull: boolean; }; userId: { type: any; allowNull: boolean; }; }, arg2: { freezeTableName: boolean; }) => any; }, Sequelize: { STRING: any; TEXT: any; DOUBLE: any; ENUM: (arg0: string, arg1: string) => any; INTEGER: any; }) {
    const Products = sequelize.define('products', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT
        },
        amount: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('available', 'unavailable'),
            defaultValue: 'available'
        },
        businessId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    }, {
        freezeTableName: true
    });

    Products.associate = function(models: { products: { belongsTo: (arg0: any, arg1: { onDelete: string; targetKey: string; foreignKey: string; }) => void; hasMany: (arg0: any, arg1: { onDelete: string; targetKey: string; foreignKey: string; }) => void; }; users: any; businesses: any; items: any; }) {
        models.products.belongsTo(models.users, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'userId'});
        models.products.belongsTo(models.businesses, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'businessId'});
        models.products.hasMany(models.items, {onDelete: 'cascade',targetKey: "id", foreignKey: 'productId'});
    };

    return Products;

}
