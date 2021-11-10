/*************************************************************************
USERS TABLE
*************************************************************************/

export default function(sequelize: { define: (arg0: string, arg1: { 
    firstName: { type: any; }; 
    lastName: { type: any; }; 
    email: { type: any; unique: boolean, validate: { isEmail: boolean } }; 
    password: { type: any; }; 
    phone: { type: any; unique: boolean }; 
    status: { type: any; defaultValue: string; }; 
}, arg2: { freezeTableName: boolean; }) => any; }, Sequelize: { STRING: any; ENUM: (arg0: string, arg1: string) => any; }) {
    const Users = sequelize.define('users', {
        firstName: {
            type: Sequelize.STRING
        },
        lastName: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING,
            unique: false,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING,
            unique: false
        },
        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
    }, {
        freezeTableName: true
    });

    Users.associate = function(models: { users: { hasMany: (arg0: any, arg1: { onDelete: string; targetKey: string; foreignKey: string; }) => void; }; invoices: any; products: any; businesses: any; }) {
        models.users.hasMany(models.invoices, {onDelete: 'cascade',targetKey: "id", foreignKey: 'userId'});
        models.users.hasMany(models.products, {onDelete: 'cascade',targetKey: "id", foreignKey: 'userId'});
        models.users.hasMany(models.businesses, {onDelete: 'cascade',targetKey: "id", foreignKey: 'userId'});
    };

    return Users;

}
