// IMPORT DATABASE FILE
import DB from '../DB/db';
import general from'../General/general';
import { validationResult } from 'express-validator';
import config from '../../config/config';
import currencies from '../../helpers/currencies';
import { generateInvoicePDF } from '../../helpers/generateInvoicePDF';
import { handleResponse, successResponse, errorResponse } from '../Helpers/helpers';
import { validateObject } from '../../helpers/validate';
import { Request } from 'express-validator/src/base';
import { AnyOperator } from 'sequelize/types';


/**
 * CREATE SINGLE INVOICE
 * @param {invoice object} req 
 * @param {*} res 
 * @param {*} next 
 */

const createInvoice= async (req: Request, res: any, next: any) => {

        try{

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // CREATE INVOICE IN DATABASE
            const {
                invoiceNumber, subTotal, discount, tax, shipping, amount, 
                amountPaid, balance, currency, dueAt, businessId, clientId
            } = req.body;
            let insert_data = {
                invoiceNumber, subTotal, discount,
                tax, shipping, amount, amountPaid,
                balance, currency, dueAt,
                businessId, clientId,
                userId: req.user.id,
            };

            // check if client exists
            const client = await DB.clients.findOne({ where: {id: clientId, userId: req.user.id } });
            if (!client)
                return handleResponse(res, 404, false, `client ID ${clientId} not found`);

            // check if business exists
            const business = await DB.businesses.findOne({ where: {id: businessId, userId: req.user.id } });
            if (!business)
                return handleResponse(res, 404, false, `Business ID ${businessId} not found`);

            // processing the line items for the invoice
            var lineItems: { productId: any; qty: any; invoiceId: any}[] = [];
            var errorArr: any[] = [];

            // looping each line item into an array
            req.body.lineItems.forEach((item: { productId: any; qty: any; }) => {
                var itemData = {
                    productId: item.productId,
                    qty: item.qty,
                    invoiceId: ''
                }
                // validates or checks if any data in the object is empty
                // const validated = validateObject(itemData);
                // if (validated) {
                    lineItems.push(itemData);
                // }
            });
            // checks if object is validated and the legnth of lineitems equals the length of inputed line items
            console.log(lineItems, req.body.lineItems)
            if (lineItems.length == req.body.lineItems.length) {
                const invoice = await DB.invoices.findOne({
                    where: {
                        invoiceNumber, 
                        businessId, clientId,
                        userId: req.user.id
                    }
                })
                if (invoice)
                    return errorResponse(res, `Invoice ${invoice.invoiceNumber} already exists for client`);
                let _invoice = await DB.invoices.create(insert_data);
                _invoice = _invoice.dataValues

                if (_invoice) {
                    lineItems.forEach(lineItem => { lineItem.invoiceId = _invoice.id;}); // adds invoiceId values to each object in the lineitems array
                    const createdItems = await DB.items.bulkCreate(lineItems) // bulk create lineItems
                    
                    if (createdItems) {
                        // _invoice.lineItems = createdItems;
                        const items = await DB.items.findAll({where: {invoiceId: _invoice.id}, include: {model: DB.products}})
                        await generateInvoicePDF(_invoice,items, business, client); // called the function for creating invoice pdf by sending the invoice Id.
                    }

                    // SEND PUBLISHED INVOICE CREATION EMAIL TO BUSINESS OWNER

                    // RETURN RESPONSE
                    return successResponse(res, 'Invoice created successfully');
                }
            } else {
                return errorResponse(res, `An error Occured`);
            }
        }
        catch(error){
            console.log(error)
            // RETURN RESPONSE
            return errorResponse(res, `An error Occured:- ${error.message}`);
        }
}

/**
 * GET INVOICES FROM DATABASE, CALLED FROM INVOICES LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getInvoices = async (req: Request, res: any, next: any) => {

    try{
        // GET ALL INVOICE FROM DATABASE

        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const invoices = await DB.invoices.findAll({ 
            where:{userId: req.user.id},
            include: [
                {model: DB.users, attributes: {exclude: ['id', 'password', 'createdAt', 'updatedAt', 'status']}},
                {model: DB.businesses, attributes: {exclude: ['id', 'createdAt', 'updatedAt', 'status']}}
            ]
        })
        // IF NO INVOICES IN DATABASE

        if(!invoices.length)
            return successResponse(res, `You have no available invoice`, invoices);
        return successResponse(res, `${invoices.length} invoice${invoices.length>1 ? 's' : ''} available and retrieved`, invoices);
    }
    catch(error){
        // RETURN ERRIR RESPONSE
        console.log(error.message)
        return errorResponse(res, `An error Occured:- ${error.message}`);
    }
}

/**
 * GET INVOICE DETAIL FROM DATABASE
 * @param {invoiceId} req 
 * @param {*} res 
 */

const getInvoiceDetail = async(req: Request, res: any, next: any) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {invoiceId} = req.body
        const invoice = await DB.invoices.findOne({
            where:{ id: invoiceId, userId: req.user.id },
            include:[
                { model: DB.items, attributes: { exclude: ['id', 'createdAt', 'updatedAt'] } },
                { model: DB.invoicePdfs, attributes: { exclude: ['id', 'invoiceId', 'createdAt', 'updatedAt'] } },
                { model: DB.users, attributes: { exclude: ['id', 'password', 'createdAt', 'updatedAt', 'status'] } },
                { model: DB.businesses, attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'status'] } }
            ]
        });
        

        // IF INVOICE NOT FOUND
        if(!invoice)
            return handleResponse(res, 404, false, `Invoice with ID ${invoiceId} not found`);

        const currencySymbol= currencies.filter((currency: { code: any; }) => currency.code === invoice.currency)[0].symbolNative;
        invoice.dataValues.currencySymbol = currencySymbol;
        
        // RETURN SUCCESS RESPONSE
        return successResponse(res, 'Invoice details retrieved', invoice)
        
    }
    catch(error){
        // RETURN ERROR RESPONSE
        return errorResponse(res, `An error Occured:- ${error.message}`);
    }
}


/**
 * PHYSICALLY DELETE SINGLE INVOICE FROM DATABASE
 * @param {invoiceId} req 
 * @param {*} res 
 */

const deleteInvoice = async (req: Request, res: any, next: any) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {invoiceId} = req.body;
        const checkInvoice = await DB.invoices.findOne({ where: { id: invoiceId, userId: req.user.id } });
        // if invoice exists in the database
        if (!checkInvoice)
            return handleResponse(res, 404, false, `Invoice with ID ${invoiceId} not found`);
        await checkInvoice.destroy({ force: true });
        return successResponse(res, `Invoice with ID ${invoiceId} successfully deleted`);
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return res.status(400).json({status: false, errormessage: error.message})
    }
}

/**
 * PHYSICALLY DELETE ALL INVOICES FROM DATABASE
 * @param {*} req 
 * @param {*} res 
 */

const deleteAllInvoices = async (req: { user: { id: any; }; }, res: any) => { 
    try{
        
        //Delete all invoices in the database

        await DB.invoices.destroy({ force: true, where: {userId: req.user.id} })

        // RETURN SUCCESS RESPONSE
        return successResponse(res, `All Invoices Deleted Successfully!`);
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return res.status(400).json({status: false, errormessage: error.message})
    }
}

/**
 * PHYSICALLY DELETE MULTIPLE INVOICES FROM DATABASE
 * @param {ids} req 
 * @param {*} res 
 */

const deleteMultipleInvoices = async (req: Request, res: any) => { 
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let ids = req.body.ids
        let errorArr = [];
        let successArr = [];
        // LOOP OVER ALL INVOICE TO UPDATE STATUS
        for(let i=0;i<ids.length;i++){
            // UPDATE INVOICE IN DATABASE
            const checkInvoice = await DB.invoices.findOne({ where: { id: ids[i], userId: req.user.id } });
            if (checkInvoice) {
                // UPDATE EXPENSE IN DATABASE
                await checkInvoice.destroy()
                successArr.push({successMsg:`Invoice with id ${ids[i]} successfully deleted`})
            } else {
                errorArr.push({errorMsg:`Invoice with id ${ids[i]} not found`});
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

/**
 * UPLOAD FILE TO s3 RETURN METHOD 
 * @param {*} req 
 * @param {*} res 
 */

const uploadFile = async (req: { files: { location: any; }[]; }, res: any) => { 
    try{
        return successResponse(res, `Operation successfull`, req.files[0].location);
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * Send an Invoice via email
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const  sendInvoiceViaEmail = async (req: Request, res: any, next: any) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {invoiceId, mailTo, mailText} = req.body;
        // checks if the ID exists
        const invoice = await DB.invoices.findOne({ 
            where:{ id: invoiceId, userId: req.user.id },
            include: [
                {
                    model: DB.users,
                    attributes: {exclude: ['id', 'password', 'createdAt', 'updatedAt', 'status']} 
                },
                {
                    model: DB.clients,
                    attributes: {exclude: ['id', 'createdAt', 'updatedAt', 'status']} 
                },
                {
                    model: DB.business,
                    attributes: {exclude: ['id','createdAt', 'updatedAt', 'status']} 
                }
            ]
        });
        if (!invoice) {
            return handleResponse(res, 404, false, `Invoice with id ${invoiceId} not found`);
        } else {
            const invoicePDF = await DB.invoicePdfs.findOne({where:{invoiceId}})
            invoice.dataValues.InvoicePDF = invoicePDF.get('File')
            var mailOptions = {
                from: invoice.business.email,
                to: mailTo.join(', '),
                subject: `${invoice.business.name} has just sent you an invoice via InvoiceApp`,
                html: mailText,
                attachments: [
                    {   // use URL as an attachment
                        filename: `invoice_#${invoice.invoiceNumber}.pdf`,
                        path: `${invoicePDF.file}`
                    },
                ]
            };
            // send mail function
            await general.sendEmail(res,mailOptions)

            await invoice.update({status: 'published'});

            // RETURN RESPONSE
            return successResponse(res, `Invoice succesfully sent to ${mailTo.join(', ')} via email`);
        }
        
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * Clone an Invoice via email
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const  cloneInvoice = async (req: Request, res: any, next: any) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {invoiceId} = req.body;
        // checks if the ID exists
        const invoice = await DB.invoices.findOne({
            where:{ id: invoiceId, userId: req.user.id },
            include: [
                { model: DB.items },
                {
                    model: DB.users,
                    attributes: {exclude: ['id', 'password', 'createdAt', 'updatedAt', 'status']} 
                },
                {
                    model: DB.clients,
                    attributes: {exclude: ['id', 'createdAt', 'updatedAt', 'status']} 
                },
                {
                    model: DB.businesses,
                    attributes: {exclude: ['id','createdAt', 'updatedAt', 'status']} 
                }
            ]
        });

        if (!invoice) {
            return handleResponse(res, 404, false, `Invoice with ID ${invoiceId} not found`);
        } else {
            const invoicePDF = await DB.invoicePdfs.findOne({where:{invoiceId}});
            const currencySymbol = currencies.filter((currency: { code: any; }) => currency.code === invoice.currency)[0].symbolNative;
            const currencyName = currencies.filter((currency: { code: any; }) => currency.code === invoice.currency)[0].name;
            const data = {...invoice, invoicePDF: invoicePDF.file, currencySymbol, currencyName }
            const {
                invoiceNumber, subTotal, discount, tax, shipping, amount, 
                amountPaid, balance, currency, dueAt, businessId, clientId
            } = invoice;
            // invoice.dataValues.InvoicePDF = invoicePDF.get('File')
            // invoice.dataValues.CurrencySymbol = currencies.filter((currency: { code: any; }) => currency.code === invoice.get('Currency'))[0].symbolNative;
            // invoice.dataValues.CurrencyName = currencies.filter((currency: { code: any; }) => currency.code === invoice.get('Currency'))[0].name;
            var invoiceData = {
                invoiceNumber,
                lineItems: [] as any,
                subTotal, discount, tax, shipping,
                amount, amountPaid, balance,
                currency, currencySymbol, currencyName, dueAt,
                businessId, clientId,
            };

            invoice.items.forEach((item: { productId: any; qty: any; }) => {
                const itemData = {
                    productId: item.productId,
                    qty: item.qty
                }
                invoiceData.lineItems.push(itemData);
            });

            // RETURN RESPONSE
            return successResponse(res, `invoice with ID ${invoiceId} clonned successfully`, invoiceData);
        }
        
    }
    catch(error){
        // RETURN RESPONSE
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

/**
 * GET INVOICE DETAIL FROM DATABASE
 * @param {invoiceId} req 
 * @param {*} res 
 */

const getCurrencies = async(req: any, res: any) => {
    try{
        return successResponse(res, 'Currencies listed successfully', currencies);
    }
    catch(error){
        return errorResponse(res, `An error occured:- ${error.message}`);
    }
}

export {
    uploadFile,deleteMultipleInvoices,deleteAllInvoices,deleteInvoice,getCurrencies,
    getInvoiceDetail,createInvoice,getInvoices,sendInvoiceViaEmail,cloneInvoice
}