var FroalaEditor = require('wysiwyg-editor-node-sdk/lib/froalaEditor.js');
var config = require('../../config');
var aws = require('aws-sdk')
var DB = require('../DB/db');
const nodemailer = require('nodemailer')
const { Op } = require('sequelize');

aws.config.update({
    secretAccessKey: config.SECRETKEY,
    accessKeyId: config.ACCESSKEY,
    region: config.REGION
});

/**
 * gets setting name and returns it's latest value, high priority DB then config 
 * @param {*} setting_name 
 */

exports.getSetting = async (res,setting_name) => {

    if(res.locals.settings){
        let settings = res.locals.settings

        if(settings.hasOwnProperty(setting_name) && settings[setting_name]!=='') 
            return settings[setting_name]
        else
            return config[setting_name]
    }
    return config[setting_name]

}

/**
 * PREPARE EMAILS TO SEND FOR DIFFERENT PURPOSES
 * @param {*} templateName 
 * @param {*} data 
 */

const prepareEmail = async (res,templateName, data) => {
    try{
        let html = config[templateName]
        // Set Mail Options
        var mailOptions = {
            from: await this.getSetting(res,'MAIL_FROM'),
            to: '',
            subject: '',
            html: html
        };


        let result = []
        // GET EMAIL LSIT FROM DATABASE
        if(data.hasOwnProperty('invoiceId')){
            mailOptions.subject = data.subject
            result = await DB.invoices.findAll({
                where:{
                    id: data.invoiceId
                }
            })
        }
        else if(data.hasOwnProperty('invoiceIds')){
            html = html.replace('{{STATUS}}',data.status)
            mailOptions.html = html
            mailOptions.subject = data.subject
            result = await DB.invoices.findAll({
                where:{
                    id: {[Op.in]:data.invoiceIds}
                }
            })
        }
        return new Promise( async function(resolve, reject) {

            let emailsResult = []
            // LOOP OVER ALL RESULT TO GET EMAIL
            if(result.length){
            for( let i = 0 ; i < result.length ; i++ ){

                    if(data.hasOwnProperty('invoiceIds')){
                        //post status being changed
                        html = html.replace('{{TITLE}}',result[i].get('InvoiceNumber'))

                        let link = data.client_base_url+'/invoices/'+result[i].dataValues.id+'/view'

                        html = html.replace('{{LINK}}',link)
                        mailOptions.html = html
                    }
                    
                mailOptions.to = result[i].get('Email')

                    let response_data = await sendEmail(res,mailOptions)
                    emailsResult.push(response_data)
                    if(i===(result.length-1)){
                        resolve(emailsResult)
                    }
                }
            }
            else{
                resolve(emailsResult)
            }
            
            
        })
    }catch(error){
        console.log(error.message)
    }
}

const sendEmail = async (res,mailOptions) => {
    try{

        let response_data = {}

        // Set Mail Authentications
        let transporter = nodemailer.createTransport({
            host: await this.getSetting(res,'MAIL_HOST'),
            secure: await this.getSetting(res,'MAIL_SECURE'),
            auth: {
                user: await this.getSetting(res,'MAIL_USERNAME'),
                pass: await this.getSetting(res,'MAIL_PASSWORD')
            }
        });

                // Send Emails
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        response_data = {
                            "status": 0,
                            "message": error,
                            "email":mailOptions.to
                        };
                    } else {
                        response_data = {
                            "status": 1,
                            "message": "Email send successfully",
                            "email":mailOptions.to
                        };
                    }

            return response_data

        });
    }
    catch(error){
        return({})
    }
}

/**
 * when any route runs, this middleware copy settings from DB to locals so that app gets latest configurations
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const loadSettingsFromDBToLocals = async (req,res,next) => {
    //this code runs on start of each call to check if user is valid

    let settings = await DB.settings.findAll()

    let setting_obj = {};

    if(settings.length){
        for(let i=0;i<settings.length;i++){

            let set = settings[i].get()

            if(Object.keys(set).length){
                setting_obj[set.Name] = set.Value
            }

        }
    }

    res.locals = { ...res.locals,settings:setting_obj }

    next();

}

/**
 * this method will copy settings from config to DB, whose are not present in DB
 */

const copySettingsFromConfigToDB = async () => {

    //first let's get settings from database

    let settings = await DB.settings.findAll()

    if(settings.length){

        for(let i=0;i<settings.length;i++){
            let setting = settings[i].get()

            if(!setting.Value){

                //we need to update this setting from config as it's value in empty
                await DB.settings.update({Value:config[setting.Name]},{
                    where:{
                        Name:setting.Name
                    }
                })

            }

        }

    }

                    }

/**
 * get all settings from DB to show them to manager on front side
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getSettings = async (req,res,next) => {
    try{
        let settings = await DB.settings.findAll({
            
                });

        return res.status(200).send({settings:settings})

            }
    catch(error){
        // RETURN ERRIR RESPONSE
        console.log(error.message)
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
            }
            }
            
/**
 * UPDATE ALL SETTINGS
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const updateAllSettings = async (req,res,next) => {

    try{
        let settings = req.body.settings
            
        if(settings && settings.length){
            for(let i=0;i<settings.length;i++){
            
                let setting = settings[i]

                await DB.settings.update({Value:setting.Value},{
                    where:{
                        Name:setting.Name
                    }
        })

            }
        }

        return res.status(200).send({status:1})

    }
    catch(error){
        // RETURN ERRIR RESPONSE
        console.log(error.message)
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
    }
    }

module.exports = {
    getSetting:exports.getSetting,
    loadSettingsFromDBToLocals,updateAllSettings,getSettings,copySettingsFromConfigToDB,prepareEmail,sendEmail
}