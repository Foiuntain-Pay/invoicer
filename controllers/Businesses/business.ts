// IMPORT DATABASE FILE
import DB from '../DB/db';
import { Op } from 'sequelize';
import { validationResult } from 'express-validator';
import { handleResponse, successResponse, errorResponse } from '../Helpers/helpers';
import { Request } from 'express-validator/src/base';


/**
 * CREATE SINGLE BUSINESS
 * @param {business object} req 
 * @param {*} res 
 * @param {*} next 
 */

const createBusiness= async (req: Request, res: any, next: any) => {

        try{

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {name, address, email, phone, logo, bankName, bankAccountName, bankAccountNumber} = req.body;
            // CREATE BUSINESS IN DATABASE

            let insert_data = {
                name,
                address,
                email,
                phone,
                logo,
                bankName: bankName.toUpperCase(),
                bankAccountName: bankAccountName.toUpperCase(),
                bankAccountNumber: bankAccountNumber,
                userId: req.user.id,
            }

            const business = await DB.businesses.findOne({
                where: {
                    [Op.or]: [ {phone}, {email} ],
                    [Op.and]: [ {bankName}, {bankAccountName}, {bankAccountNumber} ]
                }
            })
            if (!business) {
                let _business = await DB.businesses.create(insert_data);

                if (_business) {
                    // Notify business owner via email here

                    // RETURN RESPONSE
                    return successResponse(res, `Business ${_business.name} created successfully`);
                }
            } else {
                return errorResponse(res);
            }
        }
        catch(error){
            console.log(error)
            // RETURN RESPONSE
            return errorResponse(res, `An error Occured:- ${error.message}`);
        }
}

/**
 * CREATE SINGLE BUSINESS
 * @param {business object} req 
 * @param {*} res 
 * @param {*} next 
 */

 const updateBusiness = async (req: Request, res: any, next: any) => {

    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {businessId, name, address, email, phone, logo, bankName, bankAccountName, bankAccountNumber} = req.body;

        const checkBusiness = await DB.businesses.findOne({ where: { id: businessId, userId: req.user.id } });

        if (!checkBusiness) 
            return handleResponse(res, 404, false, `Business with id ${businessId} not found`);

        // CREATE BUSINESS IN DATABASE

        let update_data = {
            name: name ? name : checkBusiness.name,
            address: address ? address : checkBusiness.address,
            email: email ? email : checkBusiness.email,
            phone: phone ? phone : checkBusiness.phone,
            logo: logo ? logo : checkBusiness.logo,
            bankName: bankName ? bankName.toUpperCase() : checkBusiness.bankName,
            bankAccountName: bankAccountName ? bankAccountName.toUpperCase() : checkBusiness.bankAccountName,
            bankAccountNumber: bankAccountNumber ? bankAccountName : checkBusiness.bankAccountName,
            userId: req.user.id,
        }

        await checkBusiness.update(update_data);
        // Notify business owner via email here

        // RETURN RESPONSE
        return successResponse(res, `Business updated successfully`);
    }
    catch(error){
        console.log(error)
        // RETURN RESPONSE
        return errorResponse(res, `An error Occured:- ${error.message}`);
    }
}

/**
 * GET BUSINESSES FROM DATABASE, CALLED FROM BUSINESSES LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getBusinesses = async (req: Request, res: any, next: any) => {

    try{
        // GET ALL BUSINESS FROM DATABASE

        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() });}

        const businesses = await DB.businesses.findAll({ where:{userId: req.user.id, status: 'active'}, include: {model: DB.users, attributes: {exclude: ['id', 'password', 'createdAt', 'updatedAt', 'status']}} });

        if(businesses.length){
            return successResponse(res, `${businesses.length} business available and retrieved`, businesses);
        } else {
            return successResponse(res, `You have no available business`, businesses);
        }
    }
    catch(error){
        // RETURN ERRIR RESPONSE
        console.log(error.message)
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET BUSINESS DETAIL FROM DATABASE
 * @param {businessId} req 
 * @param {*} res 
 */

const getBusinessDetail = async(req: Request, res: any, next: any) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }

        const {businessId} = req.body;
        const business = await DB.businesses.findOne({
            where:{ id: businessId, userId: req.user.id },
            include:{ 
                model: DB.users,
                attributes: {exclude: ['id', 'password', 'createdAt', 'updatedAt', 'status']} 
            }
        });
        

        // IF BUSINESS NOT FOUND
        if(!business){
            // RETURN SUCCESS RESPONSE
            return handleResponse(res, 404, false, `Business with id ${businessId} not found`);
        } else {
            if (business.status === 'inactive')
                return errorResponse(res, 'Business not active');

            // RETURN SUCCESS RESPONSE
            return successResponse(res, 'Business retrieved', business);
        }
    }
    catch(error){
        // RETURN ERROR RESPONSE
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}


/**
 * PHYSICALLY DELETE SINGLE BUSINESS FROM DATABASE
 * @param {businessId} req 
 * @param {*} res 
 */

const deleteBusiness = async (req: Request, res: any, next: any) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const {businessId} = req.body;
        //DELETE BUSINESS IN DATABASE

        const checkBusiness = await DB.businesses.findOne({ where: { id: businessId, userId: req.user.id } });
        
        // if business exists in the database
        if (checkBusiness) {
            //DELETE BUSINESS IN DATABASE
            await checkBusiness.destroy({ force: true });

            // RETURN SUCCESS RESPONSE
            return successResponse(res, `Business with id ${businessId} successfully deleted`);
        } else {
            // else return error message
            return handleResponse(res, 404, false, `Business with id ${businessId} not found`);
        }
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE ALL BUSINESSES FROM DATABASE
 * @param {*} req 
 * @param {*} res 
 */

const deleteAllBusinesses = async (req: { user: { id: any; }; }, res: any) => { 
    try{
        
        //Delete all users' businesses in the database
        DB.businesses.destroy({
            force: true,
            where: {userID: req.user.id}
        })

        // RETURN SUCCESS RESPONSE
        return successResponse(res, `All business successfully deleted`);
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE MULTIPLE BUSINESSES FROM DATABASE
 * @param {ids} req 
 * @param {*} res 
 */

const deleteMultipleBusinesses = async (req: Request, res: any) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {ids} = req.body
        let errorArr = [];
        let successArr = [];
        // LOOP OVER ALL BUSINESS TO UPDATE STATUS
        for(let i=0;i<ids.length;i++){
            // UPDATE BUSINESS IN DATABASE
            const checkBusiness = await DB.businesses.findOne({
                where: { id: ids[i], userId: req.user.id }
            })
            if (checkBusiness) {
                // UPDATE EXPENSE IN DATABASE
                await checkBusiness.destroy();
                successArr.push({successMsg: `Business with id ${ids[i]} successfully deleted`});
            } else {
                errorArr.push({errorMsg: `Business with id ${ids[i]} not found`});
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
    deleteMultipleBusinesses,
    deleteAllBusinesses,deleteBusiness, updateBusiness,
    getBusinessDetail,createBusiness,getBusinesses
}