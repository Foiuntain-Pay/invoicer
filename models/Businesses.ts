/*************************************************************************
BUSINESSES TABLE
*************************************************************************/

export default function(sequelize: { define: (arg0: string, arg1: { name: { type: any; }; address: { type: any; }; email: { type: any; }; phone: { type: any; }; logo: { type: any; }; bankName: { type: any; }; bankAccountNumber: { type: any; }; bankAccountName: { type: any; }; status: { type: any; defaultValue: string; }; userId: { type: any; allowNull: boolean; }; }, arg2: { freezeTableName: boolean; }) => any; }, Sequelize: { STRING: any; TEXT: any; ENUM: (arg0: string, arg1: string) => any; INTEGER: any; }) {
    const Businesses = sequelize.define('businesses', {
        name: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.TEXT
        },
        email: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        logo: {
            type: Sequelize.STRING
        },
        bankName: {
            type: Sequelize.STRING
        },
        bankAccountNumber: {
            type: Sequelize.STRING
        },
        bankAccountName: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    }, {
        freezeTableName: true
    });

    Businesses.associate = function(models: { businesses: { belongsTo: (arg0: any, arg1: { onDelete: string; targetKey: string; foreignKey: string; }) => void; hasMany: (arg0: any, arg1: { onDelete: string; targetKey: string; foreignKey: string; }) => void; }; users: any; invoices: any; products: any; clients: any; }) {
        models.businesses.belongsTo(models.users, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'userId'});
        models.businesses.hasMany(models.invoices, {onDelete: 'cascade',targetKey: "id", foreignKey: 'businessId'});
        models.businesses.hasMany(models.products, {onDelete: 'cascade',targetKey: "id", foreignKey: 'businessId'});
        models.businesses.hasMany(models.clients, {onDelete: 'cascade',targetKey: "id", foreignKey: 'businessId'});
    };

    return Businesses;

}
