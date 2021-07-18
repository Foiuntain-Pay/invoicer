/*************************************************************************
USERS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    var Users = sequelize.define('users', {
        FirstName: {
            type: Sequelize.STRING,
            field: 'firstName'
        },
        LastName: {
            type: Sequelize.STRING,
            field: 'lastName'
        },
        Email: {
            type: Sequelize.STRING,
            field: 'email'
        },
        Password: {
            type: Sequelize.STRING,
            field: 'password'
        },
        Phone: {
            type: Sequelize.STRING,
            field: 'phone'
        },
        Status: {
            type: Sequelize.ENUM('active', 'inactive'),
            field: 'status',
            defaultValue: 'active'
        },
    }, {
        freezeTableName: true
    });

    Users.associate = function(models) {
        models.users.hasMany(models.invoices, {onDelete: 'cascade',targetKey: "id", foreignKey: 'userId'});
    };

    return Users;

}
