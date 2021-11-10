// IMPORT DATABASE FILE
import DB from '../DB/db';
import { Op } from 'sequelize';
import { validationResult } from 'express-validator';
import { handleResponse, successResponse, errorResponse } from '../Helpers/helpers';
import { Request } from 'express-validator/src/base';


/**
 * CREATE SINGLE CLIENT
 * @param {client object} req 
 * @param {*} res 
 * @param {*} next 
 */

const createClient= async (req: Request, res: any, next: any) => {

        try{

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {name, address, email, phone, businessId} = req.body;
            // CREATE CLIENT IN DATABASE

            let insert_data = {
                name,
                address,
                email,
                phone,
                businessId,
                userId: req.user.id,
            }

            const client = await DB.clients.findOne({ where: {name, businessId} });
            if (client)
                return errorResponse(res, `Client ${client.name} already exists`);

            const _client = await DB.clients.create(insert_data);
            if (_client) {
                // Notify client owner via email here

                // RETURN RESPONSE
                return successResponse(res, `Client ${_client.name} created successfully`);
            }
        }
        catch(error){
            console.log(error)
            // RETURN RESPONSE
            return errorResponse(res, `An error Occured:- ${error.message}`);
        }
}

/**
 * CREATE SINGLE CLIENT
 * @param {client object} req 
 * @param {*} res 
 * @param {*} next 
 */

 const updateClient = async (req: Request, res: any, next: any) => {

    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {clientId, name, address, email, phone} = req.body;

        const checkClient = await DB.clients.findOne({ where: { id: clientId, userId: req.user.id } });

        if (!checkClient) 
            return handleResponse(res, 404, false, `Client with id ${clientId} not found`);

        // CREATE CLIENT IN DATABASE

        let update_data = {
            name: name ? name : checkClient.name,
            address: address ? address : checkClient.address,
            email: email ? email : checkClient.email,
            phone: phone ? phone : checkClient.phone
        }

        await checkClient.update(update_data);
        // Notify client owner via email here

        // RETURN RESPONSE
        return successResponse(res, `Client updated successfully`);
    }
    catch(error){
        console.log(error)
        // RETURN RESPONSE
        return errorResponse(res, `An error Occured:- ${error.message}`);
    }
}

/**
 * GET CLIENTS FROM DATABASE, CALLED FROM CLIENTS LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getClients = async (req: Request, res: any, next: any) => {

    try{
        // GET ALL CLIENT FROM DATABASE

        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() });}
        const {businessId} = req.body;
        const clients = await DB.clients.findAll({ 
            where: { userId: req.user.id, status: 'active', businessId }, 
            include: [
                {
                    model: DB.users, 
                    attributes: {exclude: ['id', 'password', 'createdAt', 'updatedAt', 'status']}
                },
                {
                    model: DB.businesses,
                    attributes: {exclude: ['id', 'createdAt', 'updatedAt', 'status']}
                }
            ]
        });

        if(clients.length){
            return successResponse(res, `${clients.length} client${clients.length>1 ? 's' : ''} available and retrieved`, clients);
        } else {
            return successResponse(res, `You have no available client`, clients);
        }
    }
    catch(error){
        // RETURN ERRIR RESPONSE
        console.log(error.message)
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET CLIENT DETAIL FROM DATABASE
 * @param {clientId} req 
 * @param {*} res 
 */

const getClientDetail = async(req: Request, res: any, next: any) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }

        const {clientId} = req.body;
        const client = await DB.clients.findOne({
            where: { userId: req.user.id, status: 'active' }, 
            include: [
                {
                    model: DB.users, 
                    attributes: {exclude: ['id', 'password', 'createdAt', 'updatedAt', 'status']}
                },
                {
                    model: DB.businesses,
                    attributes: {exclude: ['id', 'createdAt', 'updatedAt', 'status']}
                }
            ]
        });
        

        // IF CLIENT NOT FOUND
        if(!client){
            // RETURN SUCCESS RESPONSE
            return handleResponse(res, 404, false, `Client with id ${clientId} not found`);
        } else {
            if (client.status === 'inactive')
                return errorResponse(res, 'Client not active');

            // RETURN SUCCESS RESPONSE
            return successResponse(res, 'Client retrieved', client);
        }
    }
    catch(error){
        // RETURN ERROR RESPONSE
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}


/**
 * PHYSICALLY DELETE SINGLE CLIENT FROM DATABASE
 * @param {clientId} req 
 * @param {*} res 
 */

const deleteClient = async (req: Request, res: any, next: any) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const {clientId, businessId} = req.body;
        //DELETE CLIENT IN DATABASE

        const checkClient = await DB.clients.findOne({ where: { id: clientId, userId: req.user.id, businessId } });
        
        // if client exists in the database
        if (checkClient) {
            //DELETE CLIENT IN DATABASE
            await checkClient.destroy({ force: true });

            // RETURN SUCCESS RESPONSE
            return successResponse(res, `Client with id ${clientId} successfully deleted`);
        } else {
            // else return error message
            return handleResponse(res, 404, false, `Client with id ${clientId} not found`);
        }
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE ALL CLIENTS FROM DATABASE
 * @param {*} req 
 * @param {*} res 
 */

const deleteAllClients = async (req: Request, res: any) => { 
    try{
        const {businessId} = req.body;
        //Delete all users' clients in the database
        DB.clients.destroy({
            force: true,
            where: {userID: req.user.id, businessId}
        })

        // RETURN SUCCESS RESPONSE
        return successResponse(res, `All client successfully deleted`);
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE MULTIPLE CLIENTS FROM DATABASE
 * @param {ids} req 
 * @param {*} res 
 */

const deleteMultipleClients = async (req: Request, res: any) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {ids, businessId} = req.body
        let errorArr = [];
        let successArr = [];
        // LOOP OVER ALL CLIENT TO UPDATE STATUS
        for(let i=0;i<ids.length;i++){
            // UPDATE CLIENT IN DATABASE
            const checkClient = await DB.clients.findOne({
                where: { id: ids[i], userId: req.user.id, businessId }
            })
            if (checkClient) {
                // UPDATE EXPENSE IN DATABASE
                await checkClient.destroy();
                successArr.push({successMsg: `Client with id ${ids[i]} successfully deleted`});
            } else {
                errorArr.push({errorMsg: `Client with id ${ids[i]} not found`});
            }
        }
        const data = {success:successArr.length, successData:successArr, failure:errorArr.length, failureData:errorArr}
        // RETURN SUCCESS RESPONSE
        return successResponse(res, `Operation successfull`, data);
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

export {
    deleteMultipleClients,
    deleteAllClients,deleteClient, updateClient,
    getClientDetail,createClient,getClients
}