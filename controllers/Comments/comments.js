// IMPORT DATABASE FILE
var DB = require('../DB/db')
const general = require('../General/general')
const { validationResult } = require('express-validator');

/**
 * create multiple comments on same or different posts, most probably to be called from curls or postman like apps
 * @param {multiple comment objects in array form} req 
 * @param {*} res 
 * @param {*} next 
 */

const createMultipleComments= async (req, res, next) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // CREATE MULTIPLE COMMENTS IN DATABASE 

        let comments = req.body.comments

        for(let i=0;i<comments.length;i++){

            let comment_data = comments[i]

            var result = await DB.comments.create({
                Status: comment_data.status,
                UserName: res.locals.userName,
                Email: res.locals.userEmail,
                Comment: comment_data.comment,
                UserId: res.locals.accountId,
                BusinessId:res.locals.businessId,
                DepartmentName:res.locals.departmentName,
                PostId: comment_data.postId
            })
            // SEND PUBLISHED POST CREATION EMAIL TO MANAGER
            if(comment_data.status === 'pending'){
                let sendEmailData = {subject:"New Comment Created",client_base_url:req.headers.client_base_url,businessId: res.locals.businessId, departmentName: res.locals.departmentName}
                await general.prepareEmail(res,'COMMENTCREATIONTEMPLATE',sendEmailData)
            }

        }

        // RETURN RESPONSE
        return res.status(200).send({comment: result.dataValues})
    }
    catch(error){
        // RETURN RESPONSE
        return res.status(400).send(JSON.stringify({message: error.message}))
    }
}

/**
 * create a comment on a post, called from view post page
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const  createComment= async (req, res, next) => {
    try{

        const errors = validationResult(req);
        console.log(errors)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // CREATE POST IN DATABASE 
        let result = await DB.comments.create({
            Status: req.body.post.status,
            UserName: res.locals.userName,
            Email: res.locals.userEmail,
            Comment: req.body.post.comment,
            UserId: res.locals.accountId,
            BusinessId:res.locals.businessId,
            DepartmentName:res.locals.departmentName,
            PostId: req.body.post.postId
            
        })
        // SEND PUBLISHED POST CREATION EMAIL TO MANAGER
        if(req.body.post.status === 'pending'){
            let sendEmailData = {subject:"New Comment Created",client_base_url:req.headers.client_base_url,businessId: res.locals.businessId, departmentName: res.locals.departmentName}
            await general.prepareEmail(res,'COMMENTCREATIONTEMPLATE',sendEmailData)
        }

        // RETURN RESPONSE
        return res.status(200).send({comment: result.dataValues})
    }
    catch(error){
        // RETURN RESPONSE
        return res.status(400).send(JSON.stringify({message: error.message}))
    }
}



/**
 * update multiple comments on same or different posts, most probably to be called from curls or postman like apps
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const updateMultipleComments= async (req, res, next) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let comments = req.body.comments

        for(let i=0;i<comments.length;i++){

            let comment_data = comments[i]

            let comment = comment_data.comment
            let id = comment_data.id

            let update_data = {
                Comment:comment
            }
    
            await DB.comments.update(update_data,{
                where:{
                    id:id
                }
            })

        }

        return res.status(200).send()
        
    }
    catch(error){
        // RETURN RESPONSE
        return res.status(400).send(JSON.stringify({message: error.message}))
    }

}


/**
 * update a comment on a post, to be called from view post page
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const updateComment= async (req, res, next) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let comment = req.body.comment
        let id = req.body.id

        let update_data = {
            Comment:comment
        }

        await DB.comments.update(update_data,{
            where:{
                id:id
            }
        })

        return res.status(200).send()
        
    }
    catch(error){
        // RETURN RESPONSE
        return res.status(400).send(JSON.stringify({message: error.message}))
    }

}

/**
 * get all comments in database, called from comments listing page
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const  getComments= async (req, res, next) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let status = "all"
        if(req.body.hasOwnProperty('status') && req.body.status!=""){
            status = req.body.status
        }

        // GET COMMETNS FROM DATABASE 
        
        let where = {}

        if(status!=="" && status!=="all"){
            where.Status = status
        }
        
        let comments = await DB.comments.findAll({
            where:where
        })
        
        let commentsList = []
        // IF NO POSTS IN DATABASE
        if(comments.length === 0){
            return res.status(200).send(JSON.stringify({entities:[]}))
        }
        else{
            // LOOP OVER ALL POST
            for(let i=0;i<comments.length;i++) {
                commentsList.push({id: comments[i].get('id'), comment: comments[i].get('Comment'), userName: comments[i].get('UserName'), status: comments[i].get('Status')})
            }
            // RETURN SUCCESS RESPONSE
            return res.status(200).send(JSON.stringify({entities:commentsList, totalCount: comments.length}))
        }
    }
    catch(error){
        // RETURN RESPONSE
        return res.status(400).send(JSON.stringify({message: error.message}))
    }
}

/**
 * get comment details from comment id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getCommentDetail= async (req, res, next) => {
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // GET COMMENt DATA FROM COMMENT ID
        let comment = await DB.comments.findOne({
            where:{
                id: req.body.commentId
            }
        })
        let postDetail = {}

        // IF COMMENT NOT FOUND
        if(comment === null){
            return res.status(200).send()
        }
        else{
            // GET COMMENT DETAILS

            postDetail = comment.dataValues

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
 * delete comment physically from database with commentid 
 * @param {*} req 
 * @param {*} res 
 */

const deleteComment = async (req,res) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let {commentId} = req.body
        // UPDATE COMMENTS IN DATABASE
        await DB.comments.destroy({
            where: {
                id: commentId
        }})
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
 * Empty the comments Table
 * @param {*} req 
 * @param {*} res 
 */

const deleteAllComments = async (req,res) => { 
    try{
        
        DB.comments.destroy({
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
 * delete multiple comments from database, with help of commentIds sent in request
 * @param {*} req 
 * @param {*} res 
 */

const deleteMultipleComments = async (req,res) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let commentIds = req.body.ids
        // LOOP OVER ALL COMMENTS TO DELETE
        for(let i=0;i<commentIds.length;i++){
            // DELETE COMMENT IN DATABASE
            await DB.comments.destroy({
                where: {
                    id: commentIds[i]
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
 * approve or reject a comment
 * @param {commentid,request} req 
 * @param {*} res 
 */

const updateCommentStatus = async (req,res) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let {commentId, status} = req.body
        // UPDATE POST IN DATABASE
        await DB.comments.update({
            Status: status,
        },
        {
            where: {
                id: commentId
        }})

        // SEND UPDATE STATUS EMAIL TO CREATOR
        let sendEmailData = {subject:"Comment Status Changed",client_base_url:req.headers.client_base_url,commentIds: [commentId], status:status}
        await general.prepareEmail(res,'COMMENTSTATUSUPDATETEMPLATE',sendEmailData)

        // RETURN SUCCESS RESPONSE
        return res.status(200).send()
    }
    catch(error){
        console.log(error.message)
        // RETURN ERROR RESPONSE
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
    }
}

module.exports = {
    updateCommentStatus,deleteMultipleComments,deleteAllComments,deleteComment,getCommentDetail,
    getComments,updateComment,updateMultipleComments,createComment,createMultipleComments
}
