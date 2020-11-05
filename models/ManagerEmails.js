/*************************************************************************
MANAGER EMAILS TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    var ManagerEmails = sequelize.define('managerEmails', {
        BusinessId: {
            type: Sequelize.INTEGER,
            field: 'businessId'
        },
        DepartmentName: {
            type: Sequelize.STRING,
            field: 'departmentName'
        },
        Email: {
            type: Sequelize.STRING,
            field: 'email'
        }        
    }, {
        freezeTableName: true
    });
    return ManagerEmails;
}