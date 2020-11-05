/*************************************************************************
API Settings TABLE
*************************************************************************/

module.exports = function(sequelize, Sequelize) {
    
    const Settings = sequelize.define('settings', {
        Name: {
            type: Sequelize.STRING,
            field: 'name'
        },
        Value: {
            type: Sequelize.STRING,
            field: 'value',
            defaultValue: null
        }
    }, {
        freezeTableName: true
    });
   
    return Settings;

}