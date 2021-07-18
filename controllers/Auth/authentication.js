var config = require('../../config')
var jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
var DB = require('../DB/db')
var { handleResponse } = require('../Helpers/helpers');


/**
 * check if user is authorized
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

 const register = async (req, res, next) => {
    
    const {firstName, lastName, phone, email, password} = req.body
    console.log(password)
    let insertData = {
        FirstName: firstName,
        LastName: lastName,
        Phone: phone,
        Email: email,
    };
    //Hash password
    const salt = await bcrypt.genSalt(15);
    const hashPassword = await bcrypt.hash(password, salt);
    // const hashPassword = await bcrypt.hashSync(password, 10);
    insertData.Password = hashPassword;
    
    try {
        let userExists = await DB.users.findOne({where:{Email:email}});
        
        // if user exists stop the process and return a message
        if (userExists) {
            return handleResponse(res, 400, false, `User with email ${email} already exists`);
        }
        let user = await DB.users.create(insertData)
        
        if (user) {
            
            let payload = { 
                id: user.id, 
                firstName: user.FirstName, 
                lastName: user.LastName, 
                phone: user.Phone,
                email: user.Email
            };
            const token = jwt.sign(payload, config.JWTSECRET);
            const data ={
                token,
                user:payload
            }
            return handleResponse(res, 200, true, `Registration successfull`, data );
        }
        else {
            return handleResponse(res, 401, false, `An error occured`);
        }
    } catch (error) {
        console.log(error);
        return handleResponse(res, 401, false, `An error occured - ${error}`);
    }
};

const login = async (req, res, next) => {
    const {email, password} = req.body;
    // console.log({email,password})
    try {
        let user = await DB.users.findOne({ where:{Email: email} });
        
        if (user) {
            const validPass = await bcrypt.compareSync(password, user.Password);
            if (!validPass) return handleResponse(res, 401, false, `Email or Password is incorrect!`);

            if (user.Status === 'inactive') return handleResponse(res, 401, false, `Account Suspended!, Please contact Administrator`);
    
            // Create and assign token
            let payload = { 
                id: user.id, 
                email: user.Email, 
                firstName: user.FirstName, 
                lastName: user.LastName,
                phone: user.Phone
            };
            const token = jwt.sign(payload, config.JWTSECRET);
    
            res.status(200).header("auth-token", token).send({ 
                success: true, 
                message: 'Operation Successfull',
                token, 
                user: payload 
            });
        }
        else {
            return handleResponse(res, 401, false, `Incorrect Email`);
        }
    } catch (error) {
        console.log(error);
        return handleResponse(res, 401, false, `An error occured - ${error}`);
    }
};

const isAuthorized = async (req, res, next) => {
    
    //this is the url without query params
    let current_route_path = req.originalUrl.split("?").shift();

    let routes_excluded_from_auth = config.ROUTES_EXCLUDED_FROM_AUTH;
    // console.log(routes_excluded_from_auth.indexOf(current_route_path));
    if(routes_excluded_from_auth.indexOf(current_route_path)>-1){
        return next();
    }
    
    let token = req.headers.authorization;
    if (!token) return handleResponse(res, 401, false, `Access Denied / Unauthorized request`);

    try {
        token = token.split(' ')[1]; // Remove Bearer from string

        if (token === 'null' || !token) return handleResponse(res, 401, false, `Unauthorized request`);

        let verifiedUser = jwt.verify(token, config.JWTSECRET);   // config.JWTSECRET => 'secretKey'
        if (!verifiedUser) return handleResponse(res, 401, false, `Unauthorized request`);

        req.user = verifiedUser; // user_id & user_type_id
        next();

    } catch (error) {
        handleResponse(res, 400, false, `Token Expired`);
    }
};

const isControl = async (req, res, next) => {
    if (req.user.roleId === 2) {
        next();
    }
    return handleResponse(res, 401, false, `Access Denied / Unauthorized request`); 
};

const isAdmin = async (req, res, next) => {
    if (req.user.roleId >= 1) {
        next();
    }
    return handleResponse(res, 401, false, `Access Denied / Unauthorized request`); 
};
    
module.exports = {
    isAuthorized, isControl, isAdmin, login, register
}