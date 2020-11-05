// IMPORT DATABASE FILE
var DB = require('../DB/db')
const { Op } = require('sequelize');
const general = require('../General/general')
const { validationResult } = require('express-validator');

/**
 * CREATE MULtiPLE POSTS
 * @param {posts array containing post objects} req 
 * @param {*} res 
 * @param {*} next 
 */

const createMultipleInvoices= async (req, res, next) => {

        try{

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // CREATE POSTS IN DATABASE

            let posts = req.body.posts

            for(let i=0;i<posts.length;i++){

                let post_data = posts[i]

                let insert_data = {
                    Title: post_data.title,
                    Description: post_data.description,
                    Status: post_data.status,
                    BusinessId: res.locals.businessId,
                    Email: res.locals.userEmail,
                    UserID: res.locals.accountId,
                    UserName:res.locals.userName,
                    RoleLevel: res.locals.roleLevel,
                    RoleName: res.locals.roleName,
                    DepartmentName: res.locals.departmentName
                }
    
                //we need to set published, if status is publish
                if(post_data.status === 'publish'){
                    insert_data.PublishedAt = new Date(Date.now()).toISOString();
                }
    
                var result = await DB.posts.create(insert_data);
                
                result = result.dataValues

                //insert post categories
                let cateogry_ids = post_data.category

                for(let i=0;i<cateogry_ids.length;i++){
                    
                    let insert_data = {
                        postId:result.id,
                        categoryId:Number(cateogry_ids[i])
                    }

                    await DB.postcategories.create(insert_data);

                }

                // SEND PUBLISHED POST CREATION EMAIL TO MANAGER
                if(post_data.status === 'publish'){
                    let sendEmailData = {subject:"New Invoice Created",client_base_url:req.headers.client_base_url,businessId: res.locals.businessId, departmentName: res.locals.departmentName}
                    await general.prepareEmail(res,'POSTCREATIONTEMPLATE',sendEmailData)
                }

            }

            // RETURN RESPONSE
            return res.status(200).send({post:result})
        }
        catch(error){
            console.log(error)
            // RETURN RESPONSE
            return res.status(400).send(JSON.stringify({message: error.message}))
        }
}


/**
 * CREATE SINGLE POST
 * @param {post object} req 
 * @param {*} res 
 * @param {*} next 
 */

const createInvoice= async (req, res, next) => {

        try{

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // CREATE POST IN DATABASE

            let insert_data = {
                InvoiceNumber: req.body.invoice.invoiceNumber,
                BillerCompanyName: req.body.invoice.billerCompanyName,
                BillerCompanyAddress: req.body.invoice.billerCompanyAddress,
                BillerCompanyLogo: req.body.invoice.billerCompanyLogo,
                BillerBankName: req.body.invoice.billerBankName,
                BillerAccountNumber: req.body.invoice.billerAccountNumber,
                RecipientCompanyName: req.body.invoice.recipientCompanyName,
                RecipientCompanyAddress: req.body.invoice.recipientCompanyAddress,
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
                BusinessId: res.locals.businessId,
                Email: res.locals.userEmail,
                UserID: res.locals.accountId,
                UserName:res.locals.userName,
                RoleLevel: res.locals.roleLevel,
                RoleName: res.locals.roleName,
                DepartmentName: res.locals.departmentName
            }

            let result = await DB.invoices.create(insert_data);
            result = result.dataValues
            
            if (result) {
                // processing the line items for the invoice
                var lineItems = []
            
                // looping each line item into an array
                req.body.lineItems.forEach(item => {
                    lineItems.push({
                        desc: item.desc,
                        qty: item.qty,
                        rate: item.rate,
                        InvoiceId: result.id
                    });
                });
                
                console.log('this is the object ' + lineItems);
                
                const createdItems = DB.items.bulkCreate(lineItems) // bulk create lineItems
                
                // if (createdItems) {
                //     createInvoice(result.id); // called the function for creating invoice pdf by sending the invoice Id.
                // }
                
            }
            
            // SEND PUBLISHED POST CREATION EMAIL TO MANAGER
            if(req.body.invoice.status === 'draft'){
                let sendEmailData = {subject:"New Invoice Created",client_base_url:req.headers.client_base_url,businessId: res.locals.businessId, departmentName: res.locals.departmentName}
                await general.prepareEmail(res,'POSTCREATIONTEMPLATE',sendEmailData)
            }

            // RETURN RESPONSE
            return res.status(200).json({
                status: true,
                data: result,
                message: 'Invoice Created'
            })
        }
        catch(error){
            console.log(error)
            // RETURN RESPONSE
            return res.status(400).json({message: error.message})
        }
}

/**
 * GET POSTS FROM DATABASE, CALLED FROM POSTS LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getInvoices = async (req, res, next) => {

    try{
        // GET ALL POST FROM DATABASE

        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let status = "all"
        if(req.body.hasOwnProperty('status') && req.body.status!=""){
            status = req.body.status
        }

        let category = "all"
        if(req.body.hasOwnProperty('category') && req.body.category!=""){
            category = req.body.category
        }

        let where = {
            BusinessId: res.locals.businessId,
            RoleLevel:{
                [Op.gte]: res.locals.roleLevel
            }
        }

        if(status!=="" && status!=="all"){
            where.Status = status
        }

        let include = []

        let include_postcategories = {
            model:DB.postcategories
        }

        if(category!=="" && category!=="all"){
            include_postcategories.where = {
                categoryId:parseInt(category)
            }
        }

        include.push(include_postcategories)

        include.push({
            model:DB.media
        })

        let post = await DB.posts.findAll({
            where:where,
            include:include
        })

        let categories = await DB.categories.findAll({
            where:{
                Status:'active'
            }
        });

        let posts = []
        // IF NO POSTS IN DATABASE
        if(post.length === 0){
            return res.status(200).send(JSON.stringify({categories,entities:[]}))
        }
        else{
            // LOOP OVER ALL POST
            for(let i=0;i<post.length;i++) {

                let postcategories = post[i].get('postcategories')

                let categories = []

                //if this post has categories
                if(postcategories.length){
                    for(let j=0;j<postcategories.length;j++){
                        let category_id = postcategories[j].dataValues.categoryId

                        //get this category name

                        let category_data = await DB.categories.findOne({
                            where:{
                                id:category_id
                            }
                        })

                        if(category_data){
                            categories.push(category_data.get('Name'))
                        }

                    }
                }

                let push_data = {
                    id: post[i].get('id'),
                    media:post[i].get('media'),
                    description: post[i].get('Description'),
                    title: post[i].get('Title'),
                    categories:categories,
                    PublishedAt: post[i].get('PublishedAt'),
                    UserName: post[i].get('UserName'),
                    status: post[i].get('Status')
                }

                posts.push(push_data)
            }

            // RETURN SUCCESS RESPONSE
            return res.status(200).send(JSON.stringify({categories,entities:posts, totalCount: post.length}))
        }
    }
    catch(error){
        // RETURN ERRIR RESPONSE
        console.log(error.message)
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
    }
}

/**
 * GET POST DETAIL FROM DATABASE
 * @param {postId} req 
 * @param {*} res 
 */

const getInvoiceDetail = async(req,res) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // GET POST DATA FROM POST ID
        let post = await DB.posts.findOne({
            where:{
                id: req.body.postId
            },
            include:[
                {
                    model:DB.postcategories
                },
                {
                    model:DB.media
                }
            ]
        })
        let postDetail = ''
        // IF POST NOT FOUND
        if(post === null){
            return res.status(200).send()
        }
        else{
            // GET POST DETAIL

            //get all categories to show in the dropdown

            let categories = await DB.categories.findAll({
                where:{
                    Status:'active'
                }
            })
            
            postDetail = {media:post.get('media'),categories:categories,id: post.get('id'),postcategories:post.get('postcategories'),description: post.get('Description'), title: post.get('Title'), status: post.get('Status')}
            // RETURN SUCCESS RESPONSE
            return res.status(200).send(postDetail)
        }
    }
    catch(error){
        // RETURN ERROR RESPONSE
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
    }
}

/**
 * UPDATE MULTIPLE POSTS IN DATABASE
 * @param {array of post objects to update} req 
 * @param {*} res 
 */

const updateMultipleInvoices = async (req,res) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let posts = req.body.posts

        for(let i=0;i<posts.length;i++){

            let post_data = posts[i]

            // UPDATE POST IN DATABASE

            let update_data = {
                Title: post_data.title,
                Description: post_data.description,
                Status: post_data.status,
                BusinessId: res.locals.businessId,
                UserID: res.locals.accountId,
                RoleLevel: res.locals.roleLevel,
                RoleName: res.locals.roleName,
                DepartmentName: res.locals.departmentName
            }

            //we need to set publishedAt, if status is publish
            //but we need to check whether this post is already published or it is being published now
            //because we don't want the issue that the publishedAt is populated everytime the post is updated
            if(post_data.status === 'publish'){

                let post_data_temp = await DB.posts.findOne({
                    where:{
                        id:post_data.id
                    }
                })

                if(post_data_temp.dataValues.Status!=="publish"){

                    //so now we are sure that the status of this post was not publish before, so this post has publishedAt null
                    //we need to populate it

                    update_data.PublishedAt = new Date(Date.now()).toISOString();
                }
                
            }
            else{
                update_data.PublishedAt = null
            }

            await DB.posts.update(update_data,
            {
                where: {
                    id: post_data.id
                }
            })

            //insert post media, if there is any

            //first delete them
            await DB.media.destroy({
                where:{
                    postId:post_data.id
                }
            })

            let media = post_data.media
            for(let media_i=0;media_i<media.length;media_i++){

                await DB.media.create({InvoiceId:post_data.id,URL:media[media_i].URL,Type:media[media_i].Type})

            }

            //now let's update categories of the post

            //first delete them
            await DB.postcategories.destroy({
                where:{
                    postId:post_data.id
                }
            })

            //now insert them one by one

            let cateogry_ids = post_data.category

            for(let i=0;i<cateogry_ids.length;i++){
                
                let insert_data = {
                    postId:post_data.id,
                    categoryId:Number(cateogry_ids[i])
                }

                await DB.postcategories.create(insert_data);

            }

            // // SEND PUBLISHED POST CREATION EMAIL
            if(post_data.status === 'publish'){
                // SEND EMAIL TO MANAGER
                let sendEmailData = {subject:"Invoice Updated",client_base_url:req.headers.client_base_url,businessId: res.locals.businessId, departmentName: res.locals.departmentName}
                await general.prepareEmail(res,'POSTCREATIONTEMPLATE',sendEmailData)

                // SEND EMAIL TO CREATOR
                sendEmailData = {subject:"Invoice Updated",client_base_url:req.headers.client_base_url,postId: post_data.id}
                await general.prepareEmail(res,'POSTUPDATETEMPLATE',sendEmailData)
            }

        }

        // RETURN SUCCESS RESPONSE
        return res.status(200).send()
    }
    catch(error){
        
        // RETURN ERROR RESPONSE
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
    }
}

/**
 * UPDATE SINGLE POST IN DATABASE
 * @param {post object} req 
 * @param {*} res 
 */

const updateInvoice = async (req,res) => {

    try{
        // UPDATE POST IN DATABASE

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let update_data = {
            Title: req.body.post.title,
            Description: req.body.post.description,
            Status: req.body.post.status,
            BusinessId: res.locals.businessId,
            UserID: res.locals.accountId,
            RoleLevel: res.locals.roleLevel,
            RoleName: res.locals.roleName,
            DepartmentName: res.locals.departmentName
        }

        //we need to set publishedAt, if status is publish
        //but we need to check whether this post is already published or it is being published now
        //because we don't want the issue that the publishedAt is populated everytime the post is updated
        if(req.body.post.status === 'publish'){

            let post_data_temp = await DB.posts.findOne({
                where:{
                    id:req.body.post.id
                }
            })

            if(post_data_temp.dataValues.Status!=="publish"){

                //so now we are sure that the status of this post was not publish before, so this post has publishedAt null
                //we need to populate it

                update_data.PublishedAt = new Date(Date.now()).toISOString();
            }
            
        }
        else{
            update_data.PublishedAt = null
        }


        await DB.posts.update(update_data,
        {
            where: {
                id: req.body.post.id
        }})

        //insert post media, if there is any

        //first delete them
        await DB.media.destroy({
            where:{
                postId:req.body.post.id
            }
        })

        let media = req.body.post.media
        for(let media_i=0;media_i<media.length;media_i++){

            await DB.media.create({InvoiceId:req.body.post.id,URL:media[media_i].URL,Type:media[media_i].Type})

        }

        //now let's update categories of the post

        //first delete them
        await DB.postcategories.destroy({
            where:{
                postId:req.body.post.id
            }
        })

        //now insert them one by one

        let cateogry_ids = req.body.post.category

        for(let i=0;i<cateogry_ids.length;i++){
            
            let insert_data = {
                postId:req.body.post.id,
                categoryId:Number(cateogry_ids[i])
            }

            await DB.postcategories.create(insert_data);

        }

        // // SEND PUBLISHED POST CREATION EMAIL
        if(req.body.post.status === 'publish'){
            // SEND EMAIL TO MANAGER
            let sendEmailData = {subject:"Invoice Updated",client_base_url:req.headers.client_base_url,businessId: res.locals.businessId, departmentName: res.locals.departmentName}
            await general.prepareEmail(res,'POSTCREATIONTEMPLATE',sendEmailData)

            // SEND EMAIL TO CREATOR
            sendEmailData = {subject:"Invoice Updated",client_base_url:req.headers.client_base_url,postId: req.body.post.id}
            await general.prepareEmail(res,'POSTUPDATETEMPLATE',sendEmailData)
        }

        let categories = await DB.categories.findAll({
            where:{
                Status:'active'
            }
        });

        let post_data = await DB.posts.findOne({
            where:{
                id:req.body.post.id
            },
            include:[
                {
                    model:DB.postcategories
                }
            ]
        })

        // RETURN SUCCESS RESPONSE
        return res.status(200).send({categories:categories,postcategories:post_data.dataValues.postcategories})
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
    }
}


/**
 * PHYSICALLY DELETE SINGLE POST FROM DATABASE
 * @param {postId} req 
 * @param {*} res 
 */

const deleteInvoice = async (req,res) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        let {postId} = req.body
        //DELETE POST IN DATABASE
        await DB.posts.destroy({
            where: {
                id: postId
            },
            force: true
        });

        let categories = await DB.categories.findAll({
            where:{
                Status:'active'
            }
        });

        // RETURN SUCCESS RESPONSE
        return res.status(200).send({categories})
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
    }
}

/**
 * PHYSICALLY DELETE ALL POSTS FROM DATABASE
 * @param {*} req 
 * @param {*} res 
 */

const deleteAllInvoices = async (req,res) => { 
    try{
        
        //Delete all posts in the database

        DB.posts.destroy({
            force: true,
            where: {}
        })

        // RETURN SUCCESS RESPONSE
        return res.status(200).send()
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
    }
}

/**
 * PHYSICALLY DELETE MULTIPLE POSTS FROM DATABASE
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
        // LOOP OVER ALL POST TO UPDATE STATUS
        for(let i=0;i<ids.length;i++){
            // UPDATE POST IN DATABASE
            await DB.posts.destroy({
                where: {
                    id: ids[i]
            }})
        }
        // RETURN SUCCESS RESPONSE
        return res.status(200).send()
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
    }
}

/**
 * UPLOAD FILE TO s3 RETURN METHOD 
 * @param {*} req 
 * @param {*} res 
 */

const uploadFile = async (req,res) => { 
    try{
        return res.status(200).send(req.files[0].location)
    }
    catch(error){
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
    }
}

module.exports = {uploadFile,deleteMultipleInvoices,deleteAllInvoices,deleteInvoice,
    updateInvoice,updateMultipleInvoices,
    getInvoiceDetail,createMultipleInvoices,createInvoice,getInvoices
}