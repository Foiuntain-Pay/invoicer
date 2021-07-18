// IMPORT DATABASE FILE
var DB = require('../DB/db')
const { Op } = require('sequelize');
const general = require('../General/general')
const { validationResult } = require('express-validator');
const config = require('../../config');
const aws = require('aws-sdk');
const csv = require('fast-csv');
const currencies = require('../../helpers/currencies.json');
const { generateInvoicePDF } = require('../../helpers/generateInvoicePDF');
const { validateObject, validateData, capitalize } = require('../../helpers/validate');


/**
 * CREATE MULtiPLE INVOICES
 * @param {invoices array containing invoice objects} req 
 * @param {*} res 
 * @param {*} next 
 */

const createMultipleInvoices= async (req, res, next) => {

        try{

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // CREATE INVOICES IN DATABASE

            let invoices = req.body.invoices
            let errorArr = [];
            let successArr = [];

            for(let i=0;i<invoices.length;i++){

                let invoice_data = invoices[i]
                let insert_data = {
                    InvoiceNumber: validateData(invoice_data.invoiceNumber, 'string', 'Invoice Number', errorArr, config, invoice_data),
                    BillerCompanyName: validateData(capitalize(invoice_data.billerCompanyName), 'string', 'Biller Company Name', errorArr, config, invoice_data),
                    BillerCompanyAddress:  validateData(invoice_data.billerCompanyAddress, 'string', 'Biller Company Addres', errorArr, config, invoice_data),
                    BillerCompanyLogo: validateData(invoice_data.billerCompanyLogo, 'string', 'Biller Company Logo', errorArr, config, invoice_data),
                    BillerBankName: validateData(invoice_data.billerBankName, 'string', 'Biller Bank Name', errorArr, config, invoice_data),
                    BillerAccountNumber: validateData(invoice_data.billerAccountNumber, 'string', 'Biller Account Number', errorArr, config, invoice_data),
                    RecipientCompanyName: validateData(capitalize(invoice_data.recipientCompanyName), 'string', 'Recipient Company Name', errorArr, config, invoice_data),
                    RecipientCompanyAddress: validateData(invoice_data.recipientCompanyAddress, 'string', 'Recipient Company Address', errorArr, config, invoice_data),
                    RecipientCompanyEmail: validateData(capitalize(invoice_data.recipientCompanyEmail), 'string', 'Recipient Company Email', errorArr, config, invoice_data),
                    RecipientCompanyPhone: validateData(invoice_data.recipientCompanyPhone, 'string', 'Recipient Company Phone', errorArr, config, invoice_data),
                    SubTotal: validateData(invoice_data.subTotal, 'number', 'Invoice Subtotal', errorArr, config, invoice_data),
                    Discount: validateData(invoice_data.discount, 'number', 'Invoice Discount', errorArr, config, invoice_data),
                    Tax: validateData(invoice_data.tax, 'number', 'Invoice Tax', errorArr, config, invoice_data),
                    Shipping: validateData(invoice_data.shipping, 'number', 'Invoice Amount', errorArr, config, invoice_data),
                    Amount: validateData(invoice_data.amount, 'number', 'Invoice Amount', errorArr, config, invoice_data),
                    AmountPaid: validateData(invoice_data.amountPaid, 'number', 'Invoice Amount Paid', errorArr, config, invoice_data),
                    Balance: validateData(invoice_data.balance, 'number', 'Invoice Balance', errorArr, config, invoice_data),
                    Currency: validateData(invoice_data.currency, 'string', 'Invoice Currency', errorArr, config, invoice_data),
                    DueAt: validateData(invoice_data.dueAt, 'string', 'Invoice Due Date', errorArr, config, invoice_data),
                    Status: validateData(invoice_data.status, 'string', 'Invoice Status', errorArr, config, invoice_data),
                    BusinessId: res.locals.businessId,
                    Email: res.locals.userEmail,
                    UserID: res.locals.accountId,
                    UserName:res.locals.userName,
                    RoleLevel: res.locals.roleLevel,
                    RoleName: res.locals.roleName,
                    DepartmentName: res.locals.departmentName
                }
                
                // processing the line items for the invoice
                var lineItems = [];

                // looping each line item into an array
                invoice_data.lineItems.forEach(item => {
                    var itemData = {
                        Description: validateData(item.description, 'string', 'Item Description', errorArr, config, invoice_data),
                        Qty: validateData(item.qty, 'number', 'Item Quantity', errorArr, config, invoice_data), 
                        Rate: validateData(item.rate, 'number', 'Item Rate', errorArr, config, invoice_data)
                    }
                    // validates or checks if any data in the object is empty
                    const validated = validateObject(itemData);
                    if (validated) {
                        lineItems.push(itemData);
                    }
                });

                // validates or checks if any data in the object is empty
                const validated = validateObject(insert_data);

                // checks if object is validated and the legnth of lineitems equals the length of inputed line items
                if (validated && lineItems.length == invoice_data.lineItems.length) {
                    const invoice = await DB.invoices.findOne({
                        where: {
                            InvoiceNumber:insert_data.InvoiceNumber, 
                            RecipientCompanyName:insert_data.RecipientCompanyName, 
                            BusinessId:insert_data.BusinessId
                        }
                    });

                    if (!invoice) {
                        var result = await DB.invoices.create(insert_data);
                        result = result.dataValues

                        if (result) {
                            lineItems.forEach(element => { element.InvoiceId = result.id;}); // adds invoiceId values to each object in the lineitems array
                            const createdItems = await DB.items.bulkCreate(lineItems) // bulk create lineItems
                            
                            if (createdItems) {
                                result.lineItems = createdItems;
                                await generateInvoicePDF(result); // called the function for creating invoice pdf by sending the invoice Id.
                                successArr.push(result)
                            }
                            
                        }

                        // SEND PUBLISHED INVOICE CREATION EMAIL TO MANAGER
                        if(invoice_data.status === 'draft'){
                            let sendEmailData = {subject:"New Invoice Created",client_base_url:req.headers.client_base_url,businessId: res.locals.businessId, departmentName: res.locals.departmentName}
                            await general.prepareEmail(res,'INVOICECREATIONTEMPLATE',sendEmailData)
                        }
                    } else {
                        let message = config.INVOICE_EXISTS_RESP_MSG.replace('{{INVOICE_NUMBER}}', insert_data.InvoiceNumber);
                        message = message.replace('{{RECIPIENT}}', insert_data.RecipientCompanyName);
                        errorArr.push({errorMsg: message, row: invoice_data})
                    }
                    
                }
                

            }

            // RETURN RESPONSE
            return res.status(200).json({
                status: true,
                invoice:{success:successArr.length, successData:successArr, failure:errorArr.length, failureData:errorArr},
                message: config.OPERATION_SUCCESSFUL_RESP_MSG
            })
        }
        catch(error){
            console.log(error)
            // RETURN RESPONSE
            return res.status(400).json({status: false, message: error.message})
        }
}


/**
 * CREATE SINGLE INVOICE
 * @param {invoice object} req 
 * @param {*} res 
 * @param {*} next 
 */

const createInvoice= async (req, res, next) => {

        try{

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // CREATE INVOICE IN DATABASE

            let insert_data = {
                InvoiceNumber: req.body.invoice.invoiceNumber,
                BillerCompanyName: capitalize(req.body.invoice.billerCompanyName),
                BillerCompanyAddress: req.body.invoice.billerCompanyAddress,
                BillerCompanyLogo: req.body.invoice.billerCompanyLogo,
                BillerBankName: capitalize(req.body.invoice.billerBankName),
                BillerAccountNumber: req.body.invoice.billerAccountNumber,
                RecipientCompanyName: req.body.invoice.recipientCompanyName,
                RecipientCompanyAddress: req.body.invoice.recipientCompanyAddress,
                RecipientCompanyEmail: req.body.invoice.recipientCompanyEmail,
                RecipientCompanyPhone: req.body.invoice.recipientCompanyPhone,
                SubTotal: req.body.invoice.subTotal,
                Discount: req.body.invoice.discount,
                Tax: req.body.invoice.tax,
                Shipping: req.body.invoice.shipping,
                Amount: req.body.invoice.amount,
                AmountPaid: req.body.invoice.amountPaid,
                Balance: req.body.invoice.balance,
                Currency: req.body.invoice.currency,
                DueAt: req.body.invoice.dueAt,
                Status: req.body.invoice.status,
                UserID: req.user.id,
            }

            // processing the line items for the invoice
            var lineItems = [];
            var errorArr = [];

            // looping each line item into an array
            req.body.invoice.lineItems.forEach(item => {
                var itemData = {
                    Description: validateData(item.description, 'string', 'Item Description', errorArr, config, item),
                    Qty: validateData(item.qty, 'number', 'Item Quantity', errorArr, config, item), 
                    Rate: validateData(item.rate, 'number', 'Item Rate', errorArr, config, item)
                }
                // validates or checks if any data in the object is empty
                const validated = validateObject(itemData);
                if (validated) {
                    lineItems.push(itemData);
                }
            });
            // checks if object is validated and the legnth of lineitems equals the length of inputed line items
            if (lineItems.length == req.body.invoice.lineItems.length) {

                const invoice = await DB.invoices.findOne({
                    where: {
                        InvoiceNumber: insert_data.InvoiceNumber, 
                        RecipientCompanyName: insert_data.RecipientCompanyName, 
                        UserID: req.user.id
                    }
                })
                if (!invoice) {
                    let result = await DB.invoices.create(insert_data);
                    result = result.dataValues

                    if (result) {
                        lineItems.forEach(element => { element.InvoiceId = result.id;}); // adds invoiceId values to each object in the lineitems array
                        const createdItems = await DB.items.bulkCreate(lineItems) // bulk create lineItems
                        
                        if (createdItems) {
                            result.lineItems = createdItems;
                            await generateInvoicePDF(result); // called the function for creating invoice pdf by sending the invoice Id.
                        }

                        // SEND PUBLISHED INVOICE CREATION EMAIL TO MANAGER
                        if(req.body.invoice.status === 'draft'){
                            let sendEmailData = {subject:"New Invoice Created",client_base_url:req.headers.client_base_url,businessId: res.locals.businessId, departmentName: res.locals.departmentName}
                            await general.prepareEmail(res,'INVOICECREATIONTEMPLATE',sendEmailData)
                        }

                        // RETURN RESPONSE
                        return res.status(200).json({
                            status: true,
                            data: result,
                            message: config.INVOICE_CREATE_SUCCESS_RESP_MSG
                        })
                        
                    }
                } else {
                    let message = config.INVOICE_EXISTS_RESP_MSG.replace('{{INVOICE_NUMBER}}', insert_data.InvoiceNumber);
                    message = message.replace('{{RECIPIENT}}', insert_data.RecipientCompanyName);
                    return res.status(400).json({
                        status: false,
                        message
                    })
                }
                
            } else {
                return res.status(400).json({
                    status: false,
                    error: errorArr,
                    message: config.INPUT_VALIDATION_ERROR
                })
            }
            
            

            
        }
        catch(error){
            console.log(error)
            // RETURN RESPONSE
            return res.status(400).json({status: false, message: error.message})
        }
}

/**
 * GET INVOICES FROM DATABASE, CALLED FROM INVOICES LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getInvoices = async (req, res, next) => {

    try{
        // GET ALL INVOICE FROM DATABASE

        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let invoice = await DB.invoices.findAll({
            where:{UserID: req.user.id}
        })

        let invoices = []
        // IF NO INVOICES IN DATABASE
        if(invoice.length === 0){
            return res.status(200).json({
                status: true,
                data:[],
                message: config.NO_AVAILABLE_INVOICE_RESP_MSG
            })
        }
        else{
            // LOOP OVER ALL INVOICE
            for(let i=0;i<invoice.length;i++) {
                // gets the lineitems and pdf for the invoice
                let lineItems = await DB.items.findAll({where:{InvoiceId:invoice[i].id}})
                let invoicePDF = await DB.invoicePdfs.findOne({where:{InvoiceId:invoice[i].id}})
                
                // adds the values for lineitems and invoice to the invoice[i] datavalue
                invoice[i].dataValues.lineItems = lineItems
                invoice[i].dataValues.invoicePDF = invoicePDF

                // pushes the data to the invoices array
                invoices.push(invoice[i])
            }

            // RETURN SUCCESS RESPONSE
            return res.status(200).json({
                status: true,
                data:invoices, 
                totalCount: invoice.length,
                message: config.INVOICE_LISTED_SUCCESS_RESP_MSG
            })
        }
    }
    catch(error){
        // RETURN ERRIR RESPONSE
        console.log(error.message)
        return res.status(400).json({status: true, errormessage: error.message})
    }
}

/**
 * GET INVOICE DETAIL FROM DATABASE
 * @param {invoiceId} req 
 * @param {*} res 
 */

const getInvoiceDetail = async(req,res) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        let invoice = await DB.invoices.findOne({
            where:{ id: req.body.invoiceId, UserID: req.user.id },
            include:{ model: DB.items }
        })
        

        // IF INVOICE NOT FOUND
        if(invoice === null){
            // RETURN SUCCESS RESPONSE
            return res.status(404).json({
                status: false,
                data: [],
                message: config.INVOICE_NOT_FOUND_RESP_MSG.replace('{{ID}}', req.body.invoiceId)
            })
        }
        else{
            
                // gets the pdf for the invoice
                let invoicePDF = await DB.invoicePdfs.findOne({where:{InvoiceId:invoice.id}})
                
                // adds the values for invoicePDF to the invoice[i] datavalue
                invoice.dataValues.invoicePDF = invoicePDF
                invoice.dataValues.CurrencySymbol = currencies.filter(currency => currency.code === invoice.get('Currency'))[0].symbolNative;

            // RETURN SUCCESS RESPONSE
            return res.status(200).json({
                status: true,
                data: invoice,
                message: config.INVOICE_DETAILS_LISTED_RESP_MSG.replace('{{ID}}', req.body.invoiceId)
            })
        }
    }
    catch(error){
        // RETURN ERROR RESPONSE
        return res.status(400).json({status: false, errormessage: error.message})
    }
}


/**
 * PHYSICALLY DELETE SINGLE INVOICE FROM DATABASE
 * @param {invoiceId} req 
 * @param {*} res 
 */

const deleteInvoice = async (req,res) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        let {invoiceId} = req.body
        //DELETE INVOICE IN DATABASE

        const checkInvoice = await DB.invoices.findOne({
            where: {
                id: invoiceId,
                UserID: req.user.id
            }
        })
        
        // if invoice exists in the database
        if (checkInvoice) {
            //DELETE INVOICE IN DATABASE
            await checkInvoice.destroy({ force: true });
    
            // RETURN SUCCESS RESPONSE
            return res.status(200).json({
                status: true,
                message: config.INVOICE_DELETED_RESP_MSG.replace('{{ID}}', invoiceId)
            })   
        } else {
            // else return error message
            return res.status(404).json({
                status: false, 
                message: config.INVOICE_NOT_FOUND_RESP_MSG.replace('{{ID}}', invoiceId)
            })
        }
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return res.status(400).json({status: true, errormessage: error.message})
    }
}

/**
 * PHYSICALLY DELETE ALL INVOICES FROM DATABASE
 * @param {*} req 
 * @param {*} res 
 */

const deleteAllInvoices = async (req,res) => { 
    try{
        
        //Delete all invoices in the database

        DB.invoices.destroy({
            force: true,
            where: {UserID: req.user.id}
        })

        // RETURN SUCCESS RESPONSE
        return res.status(200).json({
            status:true,
            message: config.ALL_INVOICE_DELETED_RESP_MSG
        })
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return res.status(400).json({status: true, errormessage: error.message})
    }
}

/**
 * PHYSICALLY DELETE MULTIPLE INVOICES FROM DATABASE
 * @param {ids} req 
 * @param {*} res 
 */

const deleteMultipleInvoices = async (req,res) => { 
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
            const checkInvoice = await DB.invoices.findOne({
                where: {
                    id: ids[i],
                    UserID: req.user.id
                }
            })
            if (checkInvoice) {
                // UPDATE EXPENSE IN DATABASE
                await checkInvoice.destroy()
                successArr.push({"successMsg":config.INVOICE_DELETED_RESP_MSG.replace('{{ID}}',ids[i])})
            } else {
                errorArr.push({"errorMsg":config.INVOICE_NOT_FOUND_RESP_MSG.replace('{{ID}}',ids[i])})
            }
        }
        // RETURN SUCCESS RESPONSE
        return res.status(200).json({
            status: true,
            data: {success:successArr.length, successData:successArr, failure:errorArr.length, failureData:errorArr},
            message: config.OPERATION_SUCCESSFUL_RESP_MSG
        })
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return res.status(400).json({status: true, errormessage: error.message})
    }
}

/**
 * UPLOAD FILE TO s3 RETURN METHOD 
 * @param {*} req 
 * @param {*} res 
 */

const uploadFile = async (req,res) => { 
    try{
        return res.status(200).json({
            data: req.files[0].location
        })
    }
    catch(error){
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
    }
}

/**
 * Send an Invoice via email
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const  sendInvoiceViaEmail = async (req, res, next) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        // checks if the ID exists
        var invoice = await DB.invoices.findOne({
            where:{ id: req.body.invoiceId, UserID: req.user.id },
        })
        if (!invoice) {
            return res.status(400).json({
                status: false,
                message: config.INVOICE_NOT_FOUND_RESP_MSG.replace('{{ID}}', req.body.invoiceId)
            });
        } else {
            let invoicePDF = await DB.invoicePdfs.findOne({where:{InvoiceId:invoice.id}})
            invoice.dataValues.InvoicePDF = invoicePDF.get('File')
            var mailOptions = {
                from: invoice.get('Email'),
                to: req.body.mailTo.join(', '),
                subject: `${invoice.get('BillerCompanyName')} has just sent you an invoice via InvoiceApp`,
                html: req.body.mailText,
                attachments: [
                    {   // use URL as an attachment
                        filename: `invoice_#${invoice.get('InvoiceNumber')}.pdf`,
                        path: `${invoice.get('InvoicePDF')}`
                    },
                ]
            };
            // send mail function
            await general.sendEmail(res,mailOptions)

            await invoice.update({Status: 'published'});

            // RETURN RESPONSE
            return res.status(200).json({
                status: true,
                message: config.MAIL_SENT_RESP_MSG.replace('{{RECIPIENTS}}', req.body.mailTo.join(', '))
            })
        }
        
    }
    catch(error){
        // RETURN RESPONSE
        return res.status(400).json({
            status: false,
            message: error.message
        })
    }
}

/**
 * Clone an Invoice via email
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const  cloneInvoice = async (req, res, next) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // checks if the ID exists
        var invoice = await DB.invoices.findOne({
            where:{ id: req.body.invoiceId, UserID: req.user.id },
            include:{ model: DB.items }
        })
        if (!invoice) {
            return res.status(400).json({
                status: false,
                message: config.INVOICE_NOT_FOUND_RESP_MSG.replace('{{ID}}', req.body.invoiceId)
            });
        } else {
            let invoicePDF = await DB.invoicePdfs.findOne({where:{InvoiceId:invoice.id}})
            invoice.dataValues.InvoicePDF = invoicePDF.get('File')
            invoice.dataValues.CurrencySymbol = currencies.filter(currency => currency.code === invoice.get('Currency'))[0].symbolNative;
            invoice.dataValues.CurrencyName = currencies.filter(currency => currency.code === invoice.get('Currency'))[0].name;
            var invoiceData = {
                invoiceNumber: invoice.get('InvoiceNumber'),
                billerCompanyName: invoice.get('BillerCompanyName'),
                billerCompanyAddress: invoice.get('BillerCompanyAddress'),
                billerCompanyLogo: invoice.get('BillerCompanyLogo'),
                billerBankName: invoice.get('BillerBankName'),
                billerAccountNumber:invoice.get('BillerAccountNumber'),
                recipientCompanyName: invoice.get('RecipientCompanyName'),
                recipientCompanyAddress: invoice.get('RecipientCompanyAddress'),
                recipientCompanyEmail: invoice.get('RecipientCompanyEmail'),
                recipientCompanyPhone: invoice.get('RecipientCompanyPhone'),
                lineItems: [],
                subTotal: invoice.get('SubTotal'),
                discount: invoice.get('Discount'),
                tax: invoice.get('Tax'),
                shipping: invoice.get('Shipping'),
                amount: invoice.get('Amount'),
                amountPaid: invoice.get('AmountPaid'),
                balance: invoice.get('Balance'),
                currency: invoice.get('Currency'),
                currencySymbol: invoice.get('CurrencySymbol'),
                currencyName: invoice.get('CurrencyName'),
                dueAt: invoice.get('DueAt'),
                status: invoice.get('Status')
            };

            invoice.dataValues.items.forEach(item => {
                var itemData = {
                    description: item.Description,
                    qty: item.Qty, 
                    rate: item.Rate
                }
                invoiceData.lineItems.push(itemData);
            });

            // RETURN RESPONSE
            return res.status(200).json({
                status: true,
                data: invoiceData,
                message: config.INVOICE_CLONED_RESP_MSG.replace('{{ID}}', req.body.invoiceId)
            })
        }
        
    }
    catch(error){
        // RETURN RESPONSE
        return res.status(400).json({
            status: false,
            message: error.message
        })
    }
}

/**
 * UPLOAD CSV FILE 
 * @param {*} req 
 * @param {*} res 
 */

const uploadCSV = async (req,res) => { 
    try{
        var s3 = new aws.S3();
        var params = {Bucket: await general.getSetting(res, "BUCKETNAME"), Key: req.files[0].key};
    
        let invoices = [];
        
        s3.getObject(params).createReadStream()
          .pipe(csv.parse({ headers: true }))
          .on("error", (error) => {
            throw error.message;
          })
          .on("data", async (row) => {
            invoices.push(row);
          })
          .on("end", async () => {
            req.body.invoices = invoices 
             
            // perform multiple create operation
            createMultipleInvoices(req,res)  
          });
    }
    catch(error){
        return res.status(400).json({
            status:false,
            errormessage: error.message
        })
    }
}

/**
 * GET INVOICE DETAIL FROM DATABASE
 * @param {invoiceId} req 
 * @param {*} res 
 */

const getCurrencies = async(req,res) => {
    try{

        return res.status(200).json({
            status:true,
            data:currencies,
            message: 'Currencies Listed Successfully'
        })
    }
    catch(error){
        // RETURN ERROR RESPONSE
        return res.status(400).json({status: false, errormessage: error.message})
    }
}

module.exports = {uploadFile,deleteMultipleInvoices,deleteAllInvoices,deleteInvoice,getCurrencies,
    getInvoiceDetail,createMultipleInvoices,createInvoice,getInvoices,sendInvoiceViaEmail,cloneInvoice,uploadCSV
}