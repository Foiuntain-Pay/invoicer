/*************************************************************************
CLIENTS TABLE
*************************************************************************/

export default function(sequelize: { define: (arg0: string, arg1: { name: { type: any; }; address: { type: any; }; email: { type: any; }; phone: { type: any; }; status: { type: any; defaultValue: string; }; businessId: { type: any; allowNull: boolean; }; userId: { type: any; allowNull: boolean; }; }, arg2: { freezeTableName: boolean; }) => any; }, Sequelize: { STRING: any; TEXT: any; ENUM: (arg0: string, arg1: string) => any; INTEGER: any; }) {
    const Clients = sequelize.define('clients', {
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
        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
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

    Clients.associate = function(models: { clients: { belongsTo: (arg0: any, arg1: { onDelete: string; targetKey: string; foreignKey: string; }) => void; hasMany: (arg0: any, arg1: { onDelete: string; targetKey: string; foreignKey: string; }) => void; }; businesses: any; users: any; invoices: any; }) {
        models.clients.belongsTo(models.businesses, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'businessId'});
        models.clients.belongsTo(models.users, {onDelete: 'CASCADE',targetKey: "id", foreignKey: 'userId'});
        models.clients.hasMany(models.invoices, {onDelete: 'cascade',targetKey: "id", foreignKey: 'clientId'});
    };

    return Clients;

}
