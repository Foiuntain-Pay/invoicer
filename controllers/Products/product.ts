// IMPORT DATABASE FILE
import DB from '../DB/db';
import { Op } from 'sequelize';
import { validationResult } from 'express-validator';
import { handleResponse, successResponse, errorResponse } from '../Helpers/helpers';
import { Request } from 'express-validator/src/base';


/**
 * CREATE SINGLE PRODUCT
 * @param {product object} req 
 * @param {*} res 
 * @param {*} next 
 */

const createProduct= async (req: Request, res: any, next: any) => {

        try{

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {name, description, amount, businessId} = req.body;
            // CREATE PRODUCT IN DATABASE

            let insert_data = {
                name,
                description,
                amount,
                businessId,
                userId: req.user.id,
            }

            const product = await DB.products.findOne({ where: {name, businessId} });

            if (!product) {
                const _product = await DB.products.create(insert_data);

                if (_product) {
                    // Notify product owner via email here

                    // RETURN RESPONSE
                    return successResponse(res, `Product ${_product.name} created successfully`);
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
 * CREATE SINGLE PRODUCT
 * @param {product object} req 
 * @param {*} res 
 * @param {*} next 
 */

 const updateProduct = async (req: Request, res: any, next: any) => {

    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {productId, name, description, amount} = req.body;

        const checkProduct = await DB.products.findOne({ where: { id: productId, userId: req.user.id } });

        if (!checkProduct) 
            return handleResponse(res, 404, false, `Product with id ${productId} not found`);

        // CREATE PRODUCT IN DATABASE

        let update_data = {
            name: name ? name : checkProduct.name,
            description: description ? description : checkProduct.description,
            amount: amount ? amount : checkProduct.amount
        }

        await checkProduct.update(update_data);
        // Notify product owner via email here

        // RETURN RESPONSE
        return successResponse(res, `Product updated successfully`);
    }
    catch(error){
        console.log(error)
        // RETURN RESPONSE
        return errorResponse(res, `An error Occured:- ${error.message}`);
    }
}

/**
 * GET PRODUCTS FROM DATABASE, CALLED FROM PRODUCTS LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getProducts = async (req: Request, res: any, next: any) => {

    try{
        // GET ALL PRODUCT FROM DATABASE

        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() });}
        const {businessId} = req.body;
        const business = await DB.businesses.findOne({ where: {id: businessId}});
        if(!business)
            return handleResponse(res, 400, false, `business with ID ${businessId} not found`);
        const products = await DB.products.findAll({ 
            where: { userId: req.user.id, status: 'available', businessId }, 
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

        if(products.length){
            return successResponse(res, `${products.length} product${products.length>1 ? 's' : ''} available and retrieved`, products);
        } else {
            return successResponse(res, `You have no available product`, products);
        }
    }
    catch(error){
        // RETURN ERRIR RESPONSE
        console.log(error.message)
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET PRODUCT DETAIL FROM DATABASE
 * @param {productId} req 
 * @param {*} res 
 */

const getProductDetail = async(req: Request, res: any, next: any) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }

        const {productId} = req.body;
        const product = await DB.products.findOne({
            where: { id: productId, userId: req.user.id, status: 'available' }, 
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
        

        // IF PRODUCT NOT FOUND
        if(!product){
            // RETURN SUCCESS RESPONSE
            return handleResponse(res, 404, false, `Product with id ${productId} not found`);
        } else {
            if (product.status === 'inactive')
                return errorResponse(res, 'Product not active');

            // RETURN SUCCESS RESPONSE
            return successResponse(res, 'Product retrieved', product);
        }
    }
    catch(error){
        // RETURN ERROR RESPONSE
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}


/**
 * PHYSICALLY DELETE SINGLE PRODUCT FROM DATABASE
 * @param {productId} req 
 * @param {*} res 
 */

const deleteProduct = async (req: Request, res: any, next: any) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const {productId, businessId} = req.body;
        //DELETE PRODUCT IN DATABASE

        const checkProduct = await DB.products.findOne({ where: { id: productId, userId: req.user.id, businessId } });
        
        // if product exists in the database
        if (checkProduct) {
            //DELETE PRODUCT IN DATABASE
            await checkProduct.destroy({ force: true });

            // RETURN SUCCESS RESPONSE
            return successResponse(res, `Product with id ${productId} successfully deleted`);
        } else {
            // else return error message
            return handleResponse(res, 404, false, `Product with id ${productId} not found`);
        }
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE ALL PRODUCTS FROM DATABASE
 * @param {*} req 
 * @param {*} res 
 */

const deleteAllProducts = async (req: Request, res: any) => { 
    try{
        const {businessId} = req.body;
        //Delete all users' products in the database
        DB.products.destroy({
            force: true,
            where: {userID: req.user.id, businessId}
        })

        // RETURN SUCCESS RESPONSE
        return successResponse(res, `All product successfully deleted`);
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * PHYSICALLY DELETE MULTIPLE PRODUCTS FROM DATABASE
 * @param {ids} req 
 * @param {*} res 
 */

const deleteMultipleProducts = async (req: Request, res: any) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {ids, businessId} = req.body
        let errorArr = [];
        let successArr = [];
        // LOOP OVER ALL PRODUCT TO UPDATE STATUS
        for(let i=0;i<ids.length;i++){
            // UPDATE PRODUCT IN DATABASE
            const checkProduct = await DB.products.findOne({
                where: { id: ids[i], userId: req.user.id, businessId }
            })
            if (checkProduct) {
                // UPDATE EXPENSE IN DATABASE
                await checkProduct.destroy();
                successArr.push({successMsg: `Product with id ${ids[i]} successfully deleted`});
            } else {
                errorArr.push({errorMsg: `Product with id ${ids[i]} not found`});
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
    deleteMultipleProducts,
    deleteAllProducts,deleteProduct, updateProduct,
    getProductDetail,createProduct,getProducts
}