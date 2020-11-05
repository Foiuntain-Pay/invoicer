var config = require('../../config')
var jwt = require('jsonwebtoken')
const fetch = require("node-fetch")
const CryptoJS = require('crypto-js')
var DB = require('../DB/db')
var ShortUniqueId = require('short-unique-id');
const { Op } = require('sequelize');
const general = require('../General/general')


/**
 * check if user is authorized
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const isAuthorized = async (req, res, next) => {

    //we have called this middleware on all routes, but there are some routes which run regardless of auth
    //so we have put those routes in config, and we will check if current route is one of those routes then return next, otherwise check auth

    //this is the url without query params
    let current_route_path = req.originalUrl.split("?").shift()

    let routes_excluded_from_auth = config.ROUTES_EXCLUDED_FROM_AUTH
    if(routes_excluded_from_auth.indexOf(current_route_path)>-1){
        return next();
    }

    //headers should have authorization field
    const { authorization } = req.headers

    //if authorization token is undefined or null or empty return unauthorized
    if (!authorization)
        return res.status(401).send({ message: 'Unauthorized' });

    //token should be in the form of Bearer asdada32424ilsnk.......

    //if authorization token does not contain Bearer then return unauthorized
    if (!authorization.startsWith('Bearer'))
        return res.status(401).send({ message: 'Unauthorized' });

    //token contains Bearer, let's check if token has data along sides Bearer key
    //we will split token with 'Bearer ', if we get an array of exact length 2 then it means token has data otherwise it does not have or it is malformed
    const split = authorization.split('Bearer ')
    if (split.length !== 2)
        return res.status(401).send({ message: 'Unauthorized' });

    //at this point we are sure that we have a valid(format) token, now let's get the token data
    const token = split[1]
    //lets decode this token
    //JSON WEB TOKENS are designed in a way that they generate exception while decoding if they are not valid or expired

    try {
        let jwtSecret = await general.getSetting(res,'JWTSECRET')
        // Decode JWT token
        let decodedToken = jwt.verify(token, jwtSecret);
        
        //if token is not valid, then we will surely not reach at this point, because non valid token would generate exception

        //so token is valid, now let's get details from this token and store in locals for later use
        let businessId = await general.getCurrentBusnessId(decodedToken.user)
        let userEmail = decodedToken.user.user_detail.email
        let accountId = decodedToken.user.user_detail.account_id
        let userName = decodedToken.user.user_detail.name
        let roleLevel = decodedToken.user.role_details.role_level
        let roleName = decodedToken.user.role_details.role_name
        let departmentName = decodedToken.user.department_name
        let permissions = decodedToken.user.permission

        let module_id = decodedToken.user.module_id

        //store in locals for later use
        res.locals = { ...res.locals, userName: userName, moduelId: module_id, businessId: businessId, userEmail: userEmail, accountId: accountId, roleLevel: roleLevel, roleName: roleName, departmentName: departmentName, permissions: permissions }
        
        //move from middleware to next
        return next();
    }
    catch (err) {
        console.error('error')
        console.error('error1')
        console.error(`${err.code} -  ${err.message}`)
        return res.status(403).send(JSON.stringify({token: ''}))
    }
}

/**
 * creates or refresh auth tokens
 * we can use different frontend app - React, Angular or normal express APP
 * in case of express APP, we get hash key and module from express APP
 * in case of react APP, we get data from config(from config.js file) or post from USER MODULE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const createJWTToken = async (req, res, next) => {
    let type = ""
    let module_id = ""
    try{
        let map = {}
        
        //we need to make sure about the FRONTEND app we are coming from
        //for EJS we have sent appType 'express', for REACT it would be undefined, because we are not sending it in case of react

        let refreshTokenData = ''
        if((req.body).hasOwnProperty('appType') && req.body.appType === 'express' ){
            
            //it is express EJS APP

            //we need to create a new token or refresh the existing one
            if((req.body).hasOwnProperty('key') && req.body.key === 'refresh' )
            {
                //refresh the existing token with help of refresh token sent from the express ejs client

                refreshTokenData = req.body.refreshToken

                //get user details from database with the help of refresh token
                let token = await DB.token.findOne({
                    where:{
                        RefreshToken: req.body.refreshToken
                    }
                })

                // IF details NOT FOUND, return with empty token 
                if(token === null){
                    return res.status(200).send(JSON.stringify({token: ''}))
                }
                else{

                    //get app key hash from the DB
                    app_key_hash = token.get('KeysHash')
                }

                map['app_key'] = app_key_hash
                map['module_id'] = req.body.module_id
                map['api'] = req.body.api
            }
            else{

                //create new token with the help of data sent from the express client

                map['module_id'] = req.body.module_id
                map['app_key'] = req.body.app_key
                map['api'] = req.body.api
            }
        }
        else{

            //it is react APP

            let authentication_method = await general.getSetting(res,'authentication_method')

            if(authentication_method=="CONFIG" || ((req.body).hasOwnProperty('key') && req.body.key === 'refresh' ) ){

                //we need to pick details from config file, or refresh the token

                let app_key_hash = ''
                if((req.body).hasOwnProperty('key') && req.body.key === 'refresh' )
                {

                    //if we need to refresh the token, then get hash key and module id from DB regarding the refresh token

                    refreshTokenData = req.body.refreshToken
                    let token = await DB.token.findOne({
                        where:{
                            RefreshToken: req.body.refreshToken
                        }
                    })

                    // IF TOKEN NOT FOUND, return with empty token
                    if(token === null){
                        return res.status(200).send(JSON.stringify({token: ''}))
                    }
                    else{
                        app_key_hash = token.get('KeysHash')
                        module_id = token.get('ModuleId')
                    }
                }
                else{

                    //we will get values(public key, private key, module id) from config and create hash key
                    let data = {};
                    data.public_key = await general.getSetting(res,'public_key')
                    data.private_key = await general.getSetting(res,'private_key')
                    module_id = await general.getSetting(res,'module_name')
                    let data_json = JSON.stringify(data);
                    
                    //create hash key from the API keys
                    var ciphertext = CryptoJS.AES.encrypt(data_json,await general.getSetting(res,'SALT'));
                    app_key_hash = ciphertext.toString()

                }

                // at this point we have app key hash and module id

                map['app_key'] = app_key_hash
                map['module_id'] = module_id
                type = "CONFIG"
            }
            else if(authentication_method=="POST"){
                
                //we will get values(hash key and module id) from POST
        
                let data = req.body;
                //let validate this data
                if(!data.hasOwnProperty('app_key_hash')){
                    return res.status(200).send(JSON.stringify({token: ''}))
                }
        
                if(!data.hasOwnProperty('module_id')){
                    return res.status(200).send(JSON.stringify({token: ''}))
                }
        
                map['module_id'] = data.module_id
                map['app_key'] = data.app_key_hash
                type = "POST"
            }
            map['api'] = await general.getSetting(res,'API_NAME')
        }

        //at this point we should have app hash key, module id, api name from all of the above cases that are also enlisted below

        //Express EJS APP
        //React APP
        //Refresh token from either express EJS or React

        //we will call the UserModule get permissions API
        let jsonmap = JSON.stringify(map);
        
        let user_module_api_url = await general.getSetting(res,'USER_MODULE_API_URL')
        
        let response = await fetch(user_module_api_url,{
            method:'POST',
            async:false,
            body:jsonmap,
            headers: {'content-type': 'application/json' }
        });
        
        let user_data = await response.json()

        let jwt_secret = await general.getSetting(res,'JWTSECRET')
        let jwt_expiry_time = await general.getSetting(res,'JWT_EXPIRY_TIME')

        // Create New JWT Token For User with a salt saved in config
        var new_token = await jwt.sign({
            user: user_data.data,
        }, jwt_secret, { expiresIn: jwt_expiry_time });

        //we have new access token here, we need to do one thing here
        //in case of manager, we need to add email to database, because we have to send emails to managers when users create posts or comments
        
        var userRole = user_data.data.role_details.role_level
        
        //level 4 is for manager
        if(userRole === 4){
            general.addManagerEmailToDB(user_data.data)
        }

        //we need to check whether there is already a token for this user

        let result = await DB.token.findOne({
            where:{
                [Op.or]:{
                    RefreshToken: refreshTokenData,
                    UID: user_data.data.user_detail.account_id,
                }
            }
        })


        // CREATE REFRESH TOKEN
        const suid = new ShortUniqueId();
        var RefreshToken = suid.randomUUID(32);

        //we must have exactly 1 record against 1 user

        //if record does not exist, then create
        if(result === null){
            // CREATE RECORD IN TOKEN TABLE
            await DB.token.create({
                RefreshToken: RefreshToken,
                UID: user_data.data.user_detail.account_id,
                KeysHash: map['app_key'],
                ModuleId: map['module_id']
            })
        }
        else{
            // UPDATE RECORD IN TOKEN TABLE as record exists
            await DB.token.update({
                RefreshToken: RefreshToken,
                UID: user_data.data.user_detail.account_id,
                KeysHash: map['app_key'],
                ModuleId: map['module_id']
            },
            {
                where: {
                    id: result.id,
            }})
        }

        //type is variable defined by us above (neither sent from any app nor from config) and it will only be POST if user opens react Blog App from USER MODULE
        // so in this(POST) case we will redirect user to react App
        //otherwise return response as JSON
        if(type === "POST"){

            let frontend_react_path = await general.getSetting(res,'FRONTENDREACTPATH')
            let frontend_login_path = await general.getSetting(res,'FRONTENDLOGINPATH')

            return res.redirect(frontend_react_path+frontend_login_path+'?token='+new_token+'&'+'RefreshToken='+RefreshToken)
        }
        else{
            return res.status(200).send(JSON.stringify({token: new_token, RefreshToken}))
    }
    }
    catch(error){
        if(type==='POST'){
            let frontend_react_path = await general.getSetting(res,'FRONTENDREACTPATH')
            return res.redirect(frontend_react_path+'/error')
        }
        else
            return res.status(400).send(JSON.stringify({token: ''}))
    }
}

 /**
     * GET USER TOKENS
     * @param {*} req 
     * @param {*} res 
    */

const getUserToken = async (req, res, next) => {
    
        const jsonwebtoken = require('jsonwebtoken');
        
        try{
            let map={};

            /*
                * lets check authentication method
                * if it is config then pick values from config
                * if it is post then get values from post
            */

            if(config.authentication_method_PostMan_testing=="POST"){
                //we will get values from POST

                let data = req.body;
                //let validate this data
                if(!data.hasOwnProperty('app_key_hash')){
                    res.redirect('/error');
                }

                if(!data.hasOwnProperty('module_id')){
                    res.redirect('/error');
                }

                map['module_id'] = data.module_id
                map['app_key'] = data.app_key_hash
            }
            else if(config.authentication_method_PostMan_testing=="CONFIG"){
                //we will get values from config

                let data = {};
                data.public_key = req.body.public_key
                data.private_key = req.body.private_key

                let data_json = JSON.stringify(data);
            
                //create hash key from the API keys (in POST method this hash is posted from dashboard )
                var ciphertext = CryptoJS.AES.encrypt(data_json,config.SALT);
                let app_key_hash = ciphertext.toString()
            
                map['app_key'] = app_key_hash
                //get module name from config, (in POST method this is also posted from the dashboard)
                map['module_id'] = req.body.module_id

            }
            
            map['api'] = 'module_access'
            map['appType'] = 'express'
            let jsonmap = JSON.stringify(map);

            let response = await fetch(config.API_URL,{
                method:'POST',
                async:false,
                body:jsonmap,
                headers: {'client_base_url':config.BASE_URL,'content-type': 'application/json'}
            });
            const ret_data = await response.json();
            
            if(ret_data.token===""){
                if(config.authentication_method=="CONFIG"){
                    res.render('login', {
                        responseType:'danger',
                        responseMessage:res.__('Invalid credentials'),
                        API_URL:config.API_URL
                    });
                }
                else{
                    res.redirect('/error');
                }
            }

            let tokenData = jsonwebtoken.verify(ret_data.token, config.JWTSECRET)
            // req.session[config.SESSIONVAR+'_token'] = ret_data.token
            // req.session[config.SESSIONVAR+'_refreshToken'] = ret_data.RefreshToken
            // req.session[config.SESSIONVAR+'_user'] = tokenData

            if(ret_data.token === ''){
                res.redirect('/error');
            }
            return res.status(200).send({token: ret_data.token, tokenData:tokenData});
        }
        catch(error){
            console.log(error)
        }
    }
    
module.exports = {
    createJWTToken,isAuthorized,getUserToken
}