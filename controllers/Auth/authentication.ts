import config from '../../config/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import DB from '../DB/db';
import { handleResponse } from '../Helpers/helpers';


/**
 * check if user is authorized
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

export const register = async (req: { body: { firstName: string; lastName: string; phone: string; email: string; password: string; }; }, res: any, next: any) => {
    const {firstName, lastName, phone, email, password} = req.body
    let insertData = {firstName, lastName, phone, email} as any;
    //Hash password
    const salt = await bcrypt.genSalt(15);
    const hashPassword = await bcrypt.hash(password, salt);
    // const hashPassword = await bcrypt.hashSync(password, 10);
    insertData.password = hashPassword;
    
    try {
        let userExists = await DB.users.findOne({where:{email}});
        
        // if user exists stop the process and return a message
        if (userExists) {
            return handleResponse(res, 400, false, `User with email ${email} already exists`);
        }
        let user = await DB.users.create(insertData)
        
        if (user) {
            const {id, firstName, lastName, phone, email} = user;
            let payload = { id, firstName, lastName, phone, email };
            const token = jwt.sign(payload, config.JWTSECRET);
            const data = { token, user:payload }
            return handleResponse(res, 200, true, `Registration successfull`, data );
        }
        else {
            return handleResponse(res, 400, false, `An error occured`);
        }
    } catch (error) {
        console.log(error);
        return handleResponse(res, 401, false, `An error occured - ${error}`);
    }
};

export const login = async (req: { body: { email: string; password: string; }; }, res: any, next: any) => {
    const {email, password} = req.body;
    try {
        const user = await DB.users.findOne({ where:{email} });
        
        if (user) {
            const {id, firstName, lastName, email, phone, status} = user
            const validPass = await bcrypt.compareSync(password, user.password);
            if (!validPass) return handleResponse(res, 401, false, `Email or Password is incorrect!`);

            if (status === 'inactive') return handleResponse(res, 401, false, `Account Suspended!, Please contact Administrator`);
    
            // Create and assign token
            let payload = { id, email, firstName, lastName, phone };
            const token = jwt.sign(payload, config.JWTSECRET);
    
            return res.status(200).header("auth-token", token).send({ 
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

export const isAuthorized = async (req: { originalUrl: string; headers: { authorization: any; }; user: string | jwt.JwtPayload; }, res: any, next: () => void) => {
    
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

export const isControl = async (req: { user: { roleId: number; }; }, res: any, next: () => void) => {
    if (req.user.roleId === 2) {
        next();
    }
    return handleResponse(res, 401, false, `Access Denied / Unauthorized request`); 
};

export const isAdmin = async (req: { user: { roleId: number; }; }, res: any, next: () => void) => {
    if (req.user.roleId >= 1) {
        next();
    }
    return handleResponse(res, 401, false, `Access Denied / Unauthorized request`); 
};
    
// export {isAuthorized, isControl, isAdmin, register}