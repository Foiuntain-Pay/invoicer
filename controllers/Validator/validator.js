const { body } = require('express-validator')

exports.validate = (method) => {
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
          body('invoice.invoiceNumber').not().isEmpty().isString().withMessage('Invoice Number must be a string'),
          body('invoice.billerCompanyName').exists().isString().withMessage('Biller Company Name must be a string'),
          body('invoice.billerCompanyAddress').exists().isString().withMessage('Biller Company Address must be a string'),
          body('invoice.billerCompanyLogo').exists().isString().withMessage('Biller Company Logo must be a string'),
          body('invoice.billerBankName').exists().isString().withMessage('Biller Bank Name must be a string'),
          body('invoice.billerAccountNumber').exists().isString().withMessage('Biller Account Number must be a string'),
          body('invoice.recipientCompanyName').exists().isString().withMessage('Recipient Company Name must be a string'),
          body('invoice.recipientCompanyAddress').exists().isString().withMessage('Recipient Company Address must be a string'),
          body('invoice.subTotal').custom(value => { return Number(value) }).withMessage('Subtotal must be an integer'),
          body('invoice.discount').custom(value => { return Number(value) }).withMessage('Discount must be an integer'),
          body('invoice.tax').custom(value => { return Number(value) }).withMessage('Tax must be an integer'),
          body('invoice.shipping').custom(value => { return Number(value) }).withMessage('Shipping must be an integer'),
          body('invoice.amount').custom(value => { return Number(value) }).withMessage('Amount must be an integer'),
          body('invoice.amountPaid').custom(value => { return Number(value) }).withMessage('Amount Paid must be an integer'),
          body('invoice.balance').custom(value => { return Number(value) }).withMessage('Balance must be an integer'),
          body('invoice.currency').exists().isString().withMessage('Currency must be a string'),
          body('invoice.dueAt').exists().isString().withMessage('Due Date must be a string'),
          body('invoice.lineItems').custom(value => { return Array.isArray(value) }),
          body('invoice.status').exists().isIn(['draft', 'publish']).withMessage('status must only include draft or publish')
        ]   
    }
    case '/invoices/createMultiple': {
      return [
         body('invoices').custom(value => { return Array.isArray(value) }),
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
    // Test
    case '/test': {
     return [
        body('invoices').custom(value => { return Array.isArray(value) }),
       ]   
    }
  }
}