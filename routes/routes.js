const express = require('express')
const router = express.Router()

var config = require('../config');

var authenticate = require('../controllers/Auth/authentication')
var permissions = require('../controllers/Permissions/permissions')
var invoices = require('../controllers/Invoices/invoice')
// var comments = require('../controllers/Comments/comments')
var media = require('../controllers/Media/media')
var general = require('../controllers/General/general');

const validator = require("../controllers/Validator/validator")
const { validationResult } = require('express-validator');

var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')

aws.config.update({
    secretAccessKey: config.SECRETKEY,
    accessKeyId: config.ACCESSKEY,
    region: config.REGION
});
const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes("csv") || file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml") || file.mimetype.includes("image/jpeg") || file.mimetype.includes("image/png")) {
    cb(null, true);
  } else {
    cb("Invalid file uploaded.", false);
  }
};

var upload = multer({
    fileFilter,
    storage: multerS3({
      s3: s3,
      bucket: config.BUCKETNAME,
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString()+'_'+file.originalname)
      }
    })
  })

/*************************************************************************
API CALL START
*************************************************************************/

/*************************************************************************
CREATE JWT TOKEN
*************************************************************************/
router.post('/',authenticate.createJWTToken)

/*************************************************************************
CRETE JWT TOKEN
*************************************************************************/
router.post('/auth', authenticate.createJWTToken)
/*************************************************************************

/*************************************************************************
CREATE POSTS API (CreateOnePost)
*************************************************************************/
router.post('/invoices/create',validator.validate('/invoices/create'), permissions.hasCreatePermission, invoices.createInvoice)

/*************************************************************************
CREATE MULTIPLE POSTS API (CreateMultiplePosts)
*************************************************************************/
router.post('/invoices/createMultiple',validator.validate('/invoices/createMultiple'), permissions.hasCreatePermission, invoices.createMultipleInvoices)

/*************************************************************************
GET POSTS API (ListAllPosts)
*************************************************************************/
router.post('/invoices/get',validator.validate('/invoices/get'), permissions.hasReadPermission, invoices.getInvoices)

/*************************************************************************
GET POST DETAIL API
*************************************************************************/
router.post('/invoices/getDetail',validator.validate('/invoices/getDetail'), permissions.hasReadPermission, invoices.getInvoiceDetail)

/*************************************************************************
DELETE POST API (DeleteOnePost)
*************************************************************************/
router.post('/invoices/delete',validator.validate('/invoices/delete'), permissions.hasDeletePermission, invoices.deleteInvoice)

/*************************************************************************
DELETE MULTIPLE POSTS API (DeleteMultiplePosts)
*************************************************************************/
router.post('/invoices/deleteMultipleInvoices',validator.validate('/invoices/deleteMultipleInvoices'), permissions.hasDeletePermission, invoices.deleteMultipleInvoices)

/*************************************************************************
DELETE ALL POSTS API (DeleteAllPosts)
*************************************************************************/
router.post('/invoices/deleteAllInvoices', permissions.hasDeletePermission, invoices.deleteAllInvoices)

/*************************************************************************
SEND INVOICE VIA EMAIL
*************************************************************************/
router.post('/invoices/sendViaEmail',validator.validate('/invoices/sendViaEmail'), permissions.hasReadPermission, invoices.sendInvoiceViaEmail)

/*************************************************************************
SEND INVOICE VIA EMAIL
*************************************************************************/
router.post('/invoices/clone',validator.validate('/invoices/clone'), permissions.hasReadPermission, invoices.cloneInvoice)

/*************************************************************************
UPLOAD FILE TO S3
*************************************************************************/
router.post('/invoices/uploadFileToS3', upload.array('uploadedFiles',1), invoices.uploadFile)

/*************************************************************************
UPLOAD CSV FILE 
*************************************************************************/
router.post('/invoices/uploadCSV', upload.array('uploadedCSVfile',1), invoices.uploadCSV)

/*************************************************************************
GET S3 FILE DOWNLOAD URL
*************************************************************************/
router.get('/getDownloadUrl',general.getDownloadUrl)

/*************************************************************************
FETCH S3 SIGNATURE TO UPLOAD FILES ON S3
*************************************************************************/
router.post('/fetchSignature', general.getSignature) 

/*************************************************************************
GET MEDIA API (ListAllMedia)
*************************************************************************/
router.post('/media/get', permissions.hasReadPermission, media.getMedia)

/*************************************************************************
DELTE MEDIA (DeleteOneMedia)
*************************************************************************/
router.post('/media/delete',validator.validate('/media/delete'), permissions.hasDeletePermission, media.deleteMedia)

/*************************************************************************
DELETE MULTIPLE MEDIAS API (DeleteMultipleMedias)
*************************************************************************/
router.post('/media/deleteMultipleMedias',validator.validate('/media/deleteMultipleMedias'), permissions.hasDeletePermission, media.deleteMultipleMedias)

/*************************************************************************
GET SETTINGS API (listAllSettings)
*************************************************************************/
router.post('/settings/get', permissions.hasManagerRole, general.getSettings)

/*************************************************************************
UPDATE SETTINGS API (updateAllSettings)
*************************************************************************/
router.post('/settings/updateAll', permissions.hasManagerRole, general.updateAllSettings)

/*************************************************************************
CREATE LOGIN ROUTE TO TEST POSTMAN
*************************************************************************/
router.post('/login',authenticate.getUserToken)


module.exports = router;