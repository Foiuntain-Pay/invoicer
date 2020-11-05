// IMPORT DATABASE FILE
var DB = require('../DB/db')
const { validationResult } = require('express-validator');

/**
 * GET POSTS FROM DATABASE, CALLED FROM POSTS LISTING PAGE
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const getMedia = async (req, res, next) => {

    try{
        // GET ALL MEDIA FROM DATABASE
        let media = await DB.media.findAll({
            include:[
                {
                    model:DB.posts,
                }
            ]
        })
       
        // IF NO POSTS IN DATABASE
        if(media.length === 0){
            return res.status(200).send(JSON.stringify({entities:[]}))
        }
        else{
            // RETURN SUCCESS RESPONSE
            return res.status(200).send(JSON.stringify({entities:media, totalCount: media.length}))
        }
    }
    catch(error){
        // RETURN ERRIR RESPONSE
        return res.status(400).send(JSON.stringify({errormessage: error.message}))
    }
}

/**
 * PHYSICALLY DELETE SINGLE MEDIA FROM DATABASE
 * @param {mediaId} req 
 * @param {*} res 
 */

const deleteMedia = async (req,res) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let {mediaId} = req.body
        // UPDATE MEDIA IN DATABASE
        await DB.media.destroy({
            where: {
                id: mediaId
            },
            force: true
        });

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
 * PHYSICALLY DELETE MULTIPLE MEDIAS FROM DATABASE
 * @param {ids} req 
 * @param {*} res 
 */

const deleteMultipleMedias = async (req,res) => { 
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let ids = req.body.ids
        // LOOP OVER ALL medias TO UPDATE STATUS
        for(let i=0;i<ids.length;i++){
            // UPDATE POST IN DATABASE
            await DB.media.destroy({
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

module.exports = {
    getMedia,deleteMedia,deleteMultipleMedias
}