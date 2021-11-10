import express from 'express';
import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

import config from '../config/config';
import {register, login, isAuthorized} from '../controllers/Auth/authentication';
import * as invoice from '../controllers/Invoices/invoice';
import * as business from '../controllers/Businesses/business';
import * as product from '../controllers/Products/product';
import * as client from '../controllers/Clients/client';

import validate from "../controllers/Validator/validator";
import { validationResult } from 'express-validator';

const router = express.Router()

aws.config.update({
    secretAccessKey: config.SECRETKEY,
    accessKeyId: config.ACCESSKEY,
    region: config.REGION
});
const s3 = new aws.S3();

const fileFilter = (req: any, file: { mimetype: string | string[]; }, cb: (arg0: string, arg1: boolean) => void) => {
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

// INVOICES ROUTES
router.post('/invoices/create',validate('/invoices/create'), invoice.createInvoice);
router.post('/invoices/get',validate('/invoices/get'), invoice.getInvoices);
router.post('/invoices/getDetail',validate('/invoices/getDetail'), invoice.getInvoiceDetail);
router.post('/invoices/delete',validate('/invoices/delete'), invoice.deleteInvoice);
router.post('/invoices/deleteMultipleInvoices',validate('/invoices/deleteMultipleInvoices'), invoice.deleteMultipleInvoices);
router.post('/invoices/deleteAllInvoices', invoice.deleteAllInvoices);
router.post('/invoices/sendViaEmail',validate('/invoices/sendViaEmail'), invoice.sendInvoiceViaEmail);
router.post('/invoices/clone',validate('/invoices/clone'), invoice.cloneInvoice);
router.get('/invoices/currencies', invoice.getCurrencies);
router.post('/invoices/uploadFileToS3', upload.array('uploadedFiles',1), invoice.uploadFile);

// BUSINESSES ROUTES
router.post('/businesses/create',validate('/businesses/create'), business.createBusiness);
router.post('/businesses/get', business.getBusinesses);
router.post('/businesses/getDetail',validate('/businesses/getDetail'), business.getBusinessDetail);
router.post('/businesses/update',validate('/businesses/update'), business.updateBusiness);
router.post('/businesses/delete',validate('/businesses/delete'), business.deleteBusiness);
router.post('/businesses/deleteMultipleBusinesses',validate('/businesses/deleteMultipleBusinesses'), business.deleteMultipleBusinesses);
router.post('/businesses/deleteAllBusinesses', business.deleteAllBusinesses);

// PRODUCTS ROUTES
router.post('/products/create',validate('/products/create'), product.createProduct);
router.post('/products/get', validate('/products/get'), product.getProducts);
router.post('/products/getDetail',validate('/products/getDetail'), product.getProductDetail);
router.post('/products/update',validate('/products/update'), product.updateProduct);
router.post('/products/delete',validate('/products/delete'), product.deleteProduct);
router.post('/products/deleteMultipleProducts',validate('/products/deleteMultipleProducts'), product.deleteMultipleProducts);
router.post('/products/deleteAllProducts', product.deleteAllProducts);

// CLIENTS ROUTES
router.post('/clients/create',validate('/clients/create'), client.createClient);
router.post('/clients/get', client.getClients);
router.post('/clients/getDetail',validate('/clients/getDetail'), client.getClientDetail);
router.post('/clients/update',validate('/clients/update'), client.updateClient);
router.post('/clients/delete',validate('/clients/delete'), client.deleteClient);
router.post('/clients/deleteMultipleClients',validate('/clients/deleteMultipleClients'), client.deleteMultipleClients);
router.post('/clients/deleteAllClients', client.deleteAllClients);

export default router