/**
 * DB Layer module.
 * Author: Adelugba Emmanuel.
 * Version: 1.0.0
 * Release Date: 08-September-2021
 * Last Updated: 08-September-2021
 */

/**
 * Module dependencies.
 */
 
import fs from 'fs';
import path from 'path';
import {Sequelize, Op, DataTypes} from 'sequelize';
import config from '../../config/config';

var db = {} as any;

// var sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, config.db.sequelizeParams);
var sequelize = new Sequelize(config.DBNAME, config.DBUSERNAME, config.DBPASSWORD, {
    host: config.DBHOST,
    port: config.DBPORT,
    // multipleStatements: true,
    dialect: config.DBDIALECT,
    logging: false,
    // dialectOptions: {
    //     ssl: { rejectUnauthorized: false }
    // }
});


// const Op = Sequelize.Op
 db.Op = Op
// load models

// fs.readdirSync(__dirname + '/../../models')
//     .filter(function(file) {
//         return (file.indexOf(".") !== 0) && (file !== "index.js");
//     })
//     .forEach(function(file) {
//         var model = sequelize.import(path.join(__dirname + '/../../models', file));
//         db[model.name] = model;
//     });

    fs.readdirSync(__dirname + '/../../models')
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = sequelize.import(path.join(__dirname + '/../../models', file));
        // var model = require(path.join(__dirname + '/../../models', file))(sequelize, DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

//Sync Database
sequelize.sync().then(async function() {
}).catch(function(err: any) {
    console.log(err, "Something went wrong with the Database Update!");
});

// exports
db.Sequelize = Sequelize;

export default db;
