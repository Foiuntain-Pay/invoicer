/*************************************************************************
API Settings TABLE
*************************************************************************/

export default function(sequelize: { define: (arg0: string, arg1: { Name: { type: any; field: string; }; Value: { type: any; field: string; defaultValue: any; }; }, arg2: { freezeTableName: boolean; }) => any; }, Sequelize: { STRING: any; }) {
    
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