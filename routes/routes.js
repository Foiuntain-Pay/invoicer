const express = require('express')
const router = express.Router()

var config = require('../config');

const {login, register, isAuthorized} = require('../controllers/Auth/authentication')
var invoices = require('../controllers/Invoices/invoice')

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

// INDEX ROUTE TO SHOW API IS WORKING FINE
router.get('/', (req, res, next) => {res.status(200).send("API Working")});

// LOGIN && REGISTER ROUTE
router.post('/login', login);
router.post('/register', register);

// DASHBORD ROUTE
// router.get('/dashboard', dashboard.billsDashboard)

/*************************************************************************
CREATE POSTS API (CreateOnePost)
*************************************************************************/
router.post('/invoices/create',validator.validate('/invoices/create'), invoices.createInvoice)

/*************************************************************************
CREATE MULTIPLE POSTS API (CreateMultiplePosts)
*************************************************************************/
router.post('/invoices/createMultiple',validator.validate('/invoices/createMultiple'), invoices.createMultipleInvoices)

/*************************************************************************
GET POSTS API (ListAllPosts)
*************************************************************************/
router.post('/invoices/get',validator.validate('/invoices/get'), invoices.getInvoices)

/*************************************************************************
GET POST DETAIL API
*************************************************************************/
router.post('/invoices/getDetail',validator.validate('/invoices/getDetail'), invoices.getInvoiceDetail)

/*************************************************************************
DELETE POST API (DeleteOnePost)
*************************************************************************/
router.post('/invoices/delete',validator.validate('/invoices/delete'), invoices.deleteInvoice)

/*************************************************************************
DELETE MULTIPLE POSTS API (DeleteMultiplePosts)
*************************************************************************/
router.post('/invoices/deleteMultipleInvoices',validator.validate('/invoices/deleteMultipleInvoices'), invoices.deleteMultipleInvoices)

/*************************************************************************
DELETE ALL POSTS API (DeleteAllPosts)
*************************************************************************/
router.post('/invoices/deleteAllInvoices', invoices.deleteAllInvoices)

/*************************************************************************
SEND INVOICE VIA EMAIL
*************************************************************************/
router.post('/invoices/sendViaEmail',validator.validate('/invoices/sendViaEmail'), invoices.sendInvoiceViaEmail)

/*************************************************************************
SEND INVOICE VIA EMAIL
*************************************************************************/
router.post('/invoices/clone',validator.validate('/invoices/clone'), invoices.cloneInvoice)

/*************************************************************************
GET CURRENCIES
*************************************************************************/
router.get('/invoices/currencies', invoices.getCurrencies)

/*************************************************************************
UPLOAD FILE TO S3
*************************************************************************/
router.post('/invoices/uploadFileToS3', upload.array('uploadedFiles',1), invoices.uploadFile)

/*************************************************************************
UPLOAD CSV FILE 
*************************************************************************/
router.post('/invoices/uploadCSV', upload.array('uploadedCSVfile',1), invoices.uploadCSV)


module.exports = router;