import { body } from 'express-validator';

const validate = (method: string) => {
  switch (method) {
    // Media
    case '/media/delete': {
      return [ 
          body('mediaId').custom(value => { return Number(value) }),
        ]   
    }
    case '/media/deleteMultipleMedias': {
      return [
         body('ids').custom(value => { return Array.isArray(value) }),
        ]   
    }
    // Invoice
    case '/invoices/getDetail': {
      return [ 
          body('invoiceId').custom(value => { return Number(value) }),
        ]   
    }
    case '/invoices/get': {
      return [ 
          body('status').optional().isString(),
          body('category').optional().isString(),
        ]   
    }
    case '/invoices/delete': {
      return [ 
          body('invoiceId').custom(value => { return Number(value) }),
        ]   
    }
    case '/invoices/create': {
      return [ 
          body('invoiceNumber').not().isEmpty().isString().withMessage('Invoice Number must be a string'),
          body('subTotal').custom(value => { return Number(value) }).withMessage('Subtotal must be an integer'),
          body('discount').exists().isNumeric().withMessage('Discount must be an integer').optional({ checkFalsy: true }),
          body('tax').exists().isNumeric().withMessage('Tax must be an integer').optional({ checkFalsy: true }),
          body('shipping').exists().isNumeric().withMessage('Shipping must be an integer').optional({ checkFalsy: true }),
          body('amount').custom(value => { return Number(value) }).withMessage('Amount must be an integer'),
          body('amountPaid').exists().isNumeric().withMessage('Amount Paid must be an integer').optional({ checkFalsy: true }),
          body('balance').custom(value => { return Number(value) }).withMessage('Balance must be an integer'),
          body('currency').exists().isString().withMessage('Currency must be a string'),
          body('dueAt').exists().isString().withMessage('Due Date must be a string'),
          body('lineItems').custom(value => { return Array.isArray(value) }),
          body('businessId').custom(value => { return Number(value) }).withMessage('businessId must be an integer'),
          body('clientId').custom(value => { return Number(value) }).withMessage('clientId must be an integer')
        ]   
    }
    case '/invoices/deleteMultipleInvoices': {
      return [
         body('ids').custom(value => { return Array.isArray(value) }),
        ]   
    }
    
    case '/invoices/sendViaEmail': {
      return [ 
          body('invoiceId').custom(value => { return Number(value) }).withMessage('Invoice ID must be an integer'),
          body('mailTo').custom(value => { return Array.isArray(value) }).withMessage('Mail recipient should be in an array'),
          body('mailText').exists().isString().withMessage('Mail Text must be a string'),
        ]   
    }
    case '/invoices/clone': {
      return [ 
          body('invoiceId').custom(value => { return Number(value) }).withMessage('Invoice ID must be an integer'),
        ]   
    }
    // Business
    case '/businesses/create': {
      return [ 
          body('name').not().isEmpty().isString().withMessage('name must be a string'),
          body('address').exists().isString().withMessage('address must be a string'),
          body('email').exists().isString().withMessage('email must be a string'),
          body('phone').exists().isString().withMessage('phone must be a string'),
          body('logo').exists().isString().withMessage('logo must be a string'),
          body('bankName').exists().isString().withMessage('bankName must be a string'),
          body('bankAccountNumber').exists().isString().withMessage('bankAccountNumber must be a string'),
          body('bankAccountName').exists().isString().withMessage('bankAccountName must be a string')
        ]   
    }
    case '/businesses/update': {
      return [ 
          body('businessId').custom(value => { return Number(value) }),
          body('name').optional().isString().withMessage('name must be a string'),
          body('address').optional().isString().withMessage('address must be a string'),
          body('email').optional().isString().withMessage('email must be a string'),
          body('phone').optional().isString().withMessage('phone must be a string'),
          body('logo').optional().isString().withMessage('logo must be a string'),
          body('bankName').optional().isString().withMessage('bankName must be a string'),
          body('bankAccountNumber').optional().isString().withMessage('bankAccountNumber must be a string'),
          body('bankAccountName').optional().isString().withMessage('bankAccountName must be a string')
        ]   
    }
    case '/businesses/getDetail': {
      return [ 
          body('businessId').custom(value => { return Number(value) }),
        ]   
    }
    case '/businesses/delete': {
      return [ 
          body('businessId').custom(value => { return Number(value) }),
        ]   
    }
    case '/businesses/deleteMultipleBusinesses': {
      return [
         body('ids').custom(value => { return Array.isArray(value) }),
        ]   
    }
    // Product
    case '/products/create': {
      return [ 
          body('name').not().isEmpty().isString().withMessage('name must be a string'),
          body('description').exists().isString().withMessage('description must be a string'),
          body('amount').exists().isString().withMessage('amount must be a string'),
          body('businessId').custom(value => { return Number(value) }).withMessage('businessId must be a number')
        ]   
    }
    case '/products/update': {
      return [ 
          body('productId').custom(value => { return Number(value) }),
          body('name').optional().isString().withMessage('name must be a string'),
          body('description').optional().isString().withMessage('description must be a string'),
          body('amount').optional().isString().withMessage('amount must be a string')
        ]   
    }
    case '/products/get': {
      return [ 
          body('businessId').custom(value => { return Number(value) }),
          body('category').optional().isString(),
        ]   
    }
    case '/products/getDetail': {
      return [ 
          body('productId').custom(value => { return Number(value) }),
        ]   
    }
    case '/products/delete': {
      return [ 
          body('productId').custom(value => { return Number(value) }),
          body('businessId').custom(value => { return Number(value) })
        ]   
    }
    case '/products/deleteMultipleProducts': {
      return [
         body('ids').custom(value => { return Array.isArray(value) }),
         body('businessId').custom(value => { return Number(value) })
        ]   
    }
    // Client
    case '/clients/create': {
      return [ 
          body('name').not().isEmpty().isString().withMessage('name must be a string'),
          body('address').exists().isString().withMessage('address must be a string'),
          body('email').exists().isString().withMessage('email must be a string'),
          body('phone').exists().isString().withMessage('phone must be a string'),
          body('businessId').custom(value => { return Number(value) }).withMessage('businessId must be a number')
        ]   
    }
    case '/clients/update': {
      return [ 
          body('clientId').custom(value => { return Number(value) }),
          body('name').optional().isString().withMessage('name must be a string'),
          body('address').optional().isString().withMessage('address must be a string'),
          body('email').optional().isString().withMessage('email must be a string'),
          body('phone').optional().isString().withMessage('phone must be a string')
        ]   
    }
    case '/clients/getDetail': {
      return [ 
          body('clientId').custom(value => { return Number(value) }),
        ]   
    }
    case '/clients/delete': {
      return [ 
          body('clientId').custom(value => { return Number(value) }),
          body('businessId').custom(value => { return Number(value) })
        ]   
    }
    case '/clients/deleteMultipleClients': {
      return [
         body('ids').custom(value => { return Array.isArray(value) }),
         body('businessId').custom(value => { return Number(value) })
        ]   
    }
    // Test
    case '/test': {
     return [
        body('invoices').custom(value => { return Array.isArray(value) }),
       ]   
    }
  }
}

export default validate