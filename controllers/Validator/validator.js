const { body } = require('express-validator')

exports.validate = (method) => {
  switch (method) {
    case '/categories/create': {
      return [ 
          body('categories').custom(value => { return Array.isArray(value) }),
        ]   
    }
    case '/media/delete': {
      return [ 
          body('mediaId').custom(value => { return Number(value) }),
        ]   
    }
    case '/comments/deleteMultipleComments': {
      return [ 
          body('ids').custom(value => { return Array.isArray(value) }),
      ]   
    }
    case '/comments/delete': {
      return [ 
          body('commentId').custom(value => { return Number(value) }),
      ]   
    }
    case '/comments/getOne': {
      return [ 
          body('commentId').custom(value => { return Number(value) }),
      ]   
    }
    case '/comments/create': {
      return [ 
          body('post.status').exists().isIn(['pending']),
          body('post.comment').exists().not().isEmpty(),
          body('post.postId').custom(value => { return Number(value) }),
      ]   
    }
    case '/comments/update': {
      return [ 
          body('comment').exists().not().isEmpty(),
          body('id').custom(value => { return Number(value) }),
      ]   
    }
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
    case '/invoices/updateStatus': {
      return [ 
          body('invoiceId').custom(value => { return Number(value) }),
          body('status').not().isEmpty(),
        ]   
    }
    case '/invoices/delete': {
      return [ 
          body('invoiceId').custom(value => { return Number(value) }),
        ]   
    }
    case '/invoices/create': {
      return [ 
          body('invoice.invoiceNumber').not().isEmpty().isString(),
          body('invoice.billerCompanyName').exists().isString(),
          body('invoice.billerCompanyAddress').exists().isString(),
          body('invoice.billerCompanyLogo').exists().isString(),
          body('invoice.billerBankName').exists().isString(),
          body('invoice.billerAccountNumber').exists().isString(),
          body('invoice.recipientCompanyName').exists().isString(),
          body('invoice.recipientCompanyAddress').exists().isString(),
          body('invoice.subTotal').custom(value => { return Number(value) }),
          body('invoice.discount').custom(value => { return Number(value) }),
          body('invoice.tax').custom(value => { return Number(value) }),
          body('invoice.shipping').custom(value => { return Number(value) }),
          body('invoice.amount').custom(value => { return Number(value) }),
          body('invoice.amountPaid').custom(value => { return Number(value) }),
          body('invoice.balance').custom(value => { return Number(value) }),
          body('invoice.currency').exists().isString(),
          body('invoice.dueAt').exists().isString(),
          body('invoice.lineItems').custom(value => { return Array.isArray(value) }),
          body('invoice.status').exists().isIn(['draft', 'publish'])
        ]   
    }
    case '/invoices/update': {
      return [ 
          body('invoice.id').custom(value => { return Number(value) }),
          body('invoice.title').not().isEmpty().isString(),
          body('invoice.description').exists().isString(),
          body('invoice.category').custom(value => { return Array.isArray(value) }),
          body('invoice.status').exists().isIn(['draft', 'publish','reject','verify'])
        ]   
    }
    case '/invoices/createMultiple': {
      return [
         body('invoices').custom(value => { return Array.isArray(value) }),
        ]   
    }
    case '/invoices/updateMultiple': {
      return [
         body('invoices').custom(value => { return Array.isArray(value) }),
        ]   
    }
    case '/invoices/deleteMultipleInvoices': {
      return [
         body('ids').custom(value => { return Array.isArray(value) }),
        ]   
    }
    case '/invoices/updateMultipleStatuses': {
      return [
         body('ids').custom(value => { return Array.isArray(value) }),
        ]   
    }
    case '/media/deleteMultipleMedias': {
      return [
         body('ids').custom(value => { return Array.isArray(value) }),
        ]   
    }
    case '/comments/createMultiple': {
      return [
         body('comments').custom(value => { return Array.isArray(value) }),
        ]   
    }
    case '/comments/updateMultiple': {
      return [
         body('comments').custom(value => { return Array.isArray(value) }),
        ]   
    }
    case '/comments/get': {
      return [ 
          body('status').optional().isString(),
      ]   
    }
    case '/comments/udpateCommentStatus': {
      return [
          body('commentId').custom(value => { return Number(value) }),
          body('status').not().isEmpty(),
        ]   
    }
    case '/test': {
     return [
        body('invoices').custom(value => { return Array.isArray(value) }),
       ]   
    }
  }
}