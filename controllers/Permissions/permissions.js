// IMPORT DATABASE FILE
var DB = require('../DB/db')
const config =  require('../../config')
const fetch = require("node-fetch")

const general = require("../General/general")

/**
 * GET USER PERMISSIONS FROM USER MODULE
 * @param {*} accountId 
 * @param {*} module_id 
 */

const getPermissionsFromUserModule = async (res,accountId, module_id) =>{
    let result = await DB.token.findOne({
        where:{
            UID: accountId,
        }
    })
    let map = {}

    let api_name = await general.getSetting(res,'API_NAME')

    map['app_key'] = result.get('KeysHash')
    map['module_id'] = module_id
    map['api'] = api_name
    let jsonmap = JSON.stringify(map);

    let user_module_api_url = await general.getSetting(res,'USER_MODULE_API_URL')

    let response = await fetch(user_module_api_url,{
        method:'POST',
        async:false,
        body:jsonmap,
        headers: {'content-type': 'application/json' }
    });
    let user_data = await response.json()
    return user_data.data.permission
}

/**
 * GET USER ROLE FROM USER MODULE
 * @param {*} accountId 
 * @param {*} module_id 
 */

const getRoleFromUserModule= async (res,accountId, module_id) =>{
    let result = await DB.token.findOne({
        where:{
            UID: accountId,
        }
    })
    let map = {}

    let api_name = await general.getSetting(res,'API_NAME')

    map['app_key'] = result.get('KeysHash')
    map['module_id'] = module_id
    map['api'] = api_name
    let jsonmap = JSON.stringify(map);

    let user_module_api_url = await general.getSetting(res,'USER_MODULE_API_URL')

    let response = await fetch(user_module_api_url,{
        method:'POST',
        async:false,
        body:jsonmap,
        headers: {'content-type': 'application/json' }
    });
    let user_data = await response.json()
    return user_data.data.role_details.role_level
}

/**
 * CHECK USER HAS READ PERMISSIONS
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const  hasReadPermission= async (req, res, next) => {
    
    try{
        var permissions = ''

        let checkpermission = await general.getSetting(res,'CHECKPERMISSION')

        if(checkpermission === 'EVERYTIME'){
            // GET PERMISSION FROM UserModule
            permissions = await getPermissionsFromUserModule(res,res.locals.accountId, res.locals.moduelId)
        }
        else{
            // GET PERMISSION FROM LOCAL
            permissions = res.locals.permissions
        }
        // CONVERT PERMISSONS STRING TO ARRAY
        var permissionsList = permissions.split(', ')
        // CHECK PERMISSION
        if(permissionsList.indexOf('read') > -1 || permissionsList.indexOf('readall') > -1 || permissionsList.indexOf('modifyall') > -1)
            return next();
        else
            return res.status(401).send(JSON.stringify({token: ''}))
    }catch(error){
        return res.status(401).send(JSON.stringify({token: ''}))
    }
}

/**
 * CHECK USER HAS CREATE PERMISSIONS
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const hasCreatePermission = async (req, res, next) => {
    try{
        var permissions = ''

        let checkpermission = await general.getSetting(res,'CHECKPERMISSION')

        if(checkpermission === 'EVERYTIME'){
            // GET PERMISSION FROM UserModule
            permissions = await getPermissionsFromUserModule(res,res.locals.accountId, res.locals.moduelId)
        }
        else{
            // GET PERMISSION FROM LOCAL
            permissions = res.locals.permissions
        }
        // CONVERT PERMISSONS STRING TO ARRAY
        var permissionsList = permissions.split(', ')
        // CHECK PERMISSION
        if(permissionsList.indexOf('create') > -1 || permissionsList.indexOf('modifyall') > -1 )
            return next();
        else
            return res.status(401).send(JSON.stringify({token: ''}))
    }catch(error){
        return res.status(401).send(JSON.stringify({token: ''}))
    }
        
}

/**
 * CHECK USER HAS DELETE PERMISSIONS
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const hasDeletePermission= async (req, res, next) => {
    try{
        var permissions = ''

        let checkpermission = await general.getSetting(res,'CHECKPERMISSION')

        if(checkpermission === 'EVERYTIME'){
            // GET PERMISSION FROM UserModule
            permissions = await getPermissionsFromUserModule(res,res.locals.accountId, res.locals.moduelId)
        }
        else{
            // GET PERMISSION FROM LOCAL
            permissions = res.locals.permissions
        }
        // CONVERT PERMISSONS STRING TO ARRAY
        var permissionsList = permissions.split(', ')
        // CHECK PERMISSION
        if(permissionsList.indexOf('delete') > -1 || permissionsList.indexOf('modifyall') > -1)
            return next();
        else
            return res.status(401).send(JSON.stringify({token: ''}))
    }catch(error){
        return res.status(401).send(JSON.stringify({token: ''}))
    }
        
}

/**
 * CHECK USER HAS EDIT/UPDATE PERMISSIONS
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const hasEditPermission= async (req, res, next) => {
    try{

        var permissions = ''

        let checkpermission = await general.getSetting(res,'CHECKPERMISSION')

        if(checkpermission === 'EVERYTIME'){
            // GET PERMISSION FROM UserModule
            permissions = await getPermissionsFromUserModule(res,res.locals.accountId, res.locals.moduelId)
        }
        else{
            // GET PERMISSION FROM LOCAL
            permissions = res.locals.permissions
        }

        // CONVERT PERMISSONS STRING TO ARRAY
        var permissionsList = permissions.split(', ')
        // CHECK PERMISSION
        if(permissionsList.indexOf('update') > -1 || permissionsList.indexOf('modifyall') > -1)
            return next();
        else
            return res.status(401).send(JSON.stringify({token: ''}))
    }catch(error){
        console.log(error.message)
        return res.status(401).send(JSON.stringify({token: ''}))
    }
        
}

/**
 * CHECK USER HAS MANAGAER ROLE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const hasManagerRole = async (req, res, next) => {

    try{
        var role = ''

        let checkpermission = await general.getSetting(res,'CHECKPERMISSION')

        if(checkpermission === 'EVERYTIME'){
            // GET ROLE FROM UserModule
            role = await getRoleFromUserModule(res,res.locals.accountId, res.locals.moduelId)
        }
        else{
            // GET ROLE FROM LOCAL
            role = res.locals.roleLevel    
        }
        
        // CHECK 
        if(role === 4)
            return next();
        else
            return res.status(401).send(JSON.stringify({token: ''}))
    }catch(error){
        return res.status(401).send(JSON.stringify({token: ''}))
    }
        
}

module.exports = {
    hasEditPermission,hasDeletePermission,hasCreatePermission,hasReadPermission,hasManagerRole
}