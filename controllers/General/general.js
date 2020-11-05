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
 * GET FROALA SIGNATURE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const  getSignature= async (req, res, next) => {
    var configs = {
        // BUCKER NAME.
        bucket: await this.getSetting(res,'BUCKETNAME'),
    
        // S3 REGION
        region: await this.getSetting(res,'REGION'),
    
        // FOLDER NAME
        keyStart: '',
    
        // FILE ACCESS
        acl: await this.getSetting(res,'ACL'),
    
        // AWS KEYS
        accessKey: await this.getSetting(res,'ACCESSKEY'),
        secretKey: await this.getSetting(res,'SECRETKEY')
    }
    try{
        // GENERATE HASH
        var s3Hash = FroalaEditor.S3.getHash(configs);
        // SEND HASH
        res.send(s3Hash);
    }catch(error){
        res.send('s3Hash');
        // console.log(error.message)
    }
}

/**
 * GET S3 FILE DOWNLOAD URL
 * @param {*} req 
 * @param {*} res 
 */

const getDownloadUrl = async (req, res) => {

	const s3 = new aws.S3(); 	
	try {
        var fileName = req.query.file

        const myBucket = await this.getSetting(res,'BUCKETNAME')

        const myKey = fileName.replace("https://"+myBucket+".s3.amazonaws.com/", '')

        let signedUrlExpireSeconds = await this.getSetting(res,'S3_SIGNED_URL_EXPIRYTIME')

        signedUrlExpireSeconds = Number(signedUrlExpireSeconds)

		const url = s3.getSignedUrl('getObject', {
			Bucket: myBucket,
			Key: myKey,
			Expires: signedUrlExpireSeconds
        })
		res.redirect(url)	
	} catch (err) {
		console.log(err.message)
		res.status(400).send(err.message)	
	}
}

/**
 * ADD MANAGER EMAIL TO DB
 * @param {*} dataObject 
 */

const addManagerEmailToDB = async (dataObject) => {
	try {
        let userBusinessId = await this.getCurrentBusnessId(dataObject)
        let userEmail = dataObject.user_detail.email
        let depName = dataObject.department_name
        let result = await DB.managerEmails.findAll({
            where:{
                BusinessId: userBusinessId,
                DepartmentName: depName,
                Email: userEmail,
            }
        })
        if(result.length === 0 || result.length === undefined){
            await DB.managerEmails.create({
                BusinessId: userBusinessId,
                DepartmentName: depName,
                Email: userEmail,
            })
        }
	} catch (err) {
		//console.log(err)
		// res.status(400).send(err.message)	
	}
}

/**
 * GET CURRENT USER ID
 * @param {*} dataObject 
 */

const getCurrentBusnessId = (dataObject) => {
    try {
        let userBusinessesList = dataObject.businesses
        let userBusinessId = 0
        for(let i=0;i<userBusinessesList.length; i++){
            if(userBusinessesList[i].name === dataObject.current_business)
            {
                userBusinessId = userBusinessesList[i].id
            }
        }
        return userBusinessId
	} catch (err) {
		return ''	
	}
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
        if(data.hasOwnProperty('postId')){
            mailOptions.subject = data.subject
            result = await DB.posts.findAll({
                where:{
                    id: data.postId
                }
            })
        }
        else if(data.hasOwnProperty('postIds')){
            html = html.replace('{{STATUS}}',data.status)
            mailOptions.html = html
            mailOptions.subject = data.subject
            result = await DB.posts.findAll({
                where:{
                    id: {[Op.in]:data.postIds}
                }
            })
        }
        else if(data.hasOwnProperty('commentIds')){
            html = html.replace('{{STATUS}}',data.status)
            mailOptions.html = html
            mailOptions.subject = data.subject
            result = await DB.comments.findAll({
                where:{
                    id: {[Op.in]:data.commentIds}
                }
            })
        }
        else{
            if(templateName === 'COMMENTCREATIONTEMPLATE'){
                mailOptions.subject = data.subject
            }
            else{
                mailOptions.subject = data.subject
            }
            result = await DB.managerEmails.findAll({
                where:{
                    BusinessId: data.businessId,
                    DepartmentName: data.departmentName
                }
            })
        }
        return new Promise( async function(resolve, reject) {

            let emailsResult = []
            // LOOP OVER ALL RESULT TO GET EMAIL
            if(result.length){
            for( let i = 0 ; i < result.length ; i++ ){

                    if(data.hasOwnProperty('postIds')){
                        //post status being changed
                        html = html.replace('{{TITLE}}',result[i].get('Title'))

                        let link = data.client_base_url+'/posts/'+result[i].dataValues.id+'/view'

                        html = html.replace('{{LINK}}',link)
                        mailOptions.html = html
                    }
                    else if(data.hasOwnProperty('commentIds')){
                        //comment status being changed
                        let link = data.client_base_url+'/posts/'+result[i].dataValues.PostId+'/view'

                        html = html.replace('{{LINK}}',link)

                        html = html.replace('{{COMMENT}}',result[i].dataValues.Comment)

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
    loadSettingsFromDBToLocals,updateAllSettings,getSettings,copySettingsFromConfigToDB,getCurrentBusnessId,addManagerEmailToDB,getDownloadUrl,getSignature,prepareEmail,sendEmail
}