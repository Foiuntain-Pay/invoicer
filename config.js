var config = {}
// psql -h 18.219.241.75 -d invoice-app -U postgres -W
config.DBNAME = "invoice-app"
config.DBUSERNAME="postgres"
config.DBPASSWORD="pali@0LKI54!"
config.DBDIALECT = "postgres"
config.DBPORT = 5432
config.DBREGION = 'us-east-1'
config.DBHOST = '18.219.241.75'
config.PORT = process.env.PORT || 1337
// config.PORT = 1337
config.JWTSECRET = 'S74R73RK17'
config.JWT_EXPIRY_TIME = '1h'
config.SSL = true

config.BUCKETNAME = 'bringforthjoy' //'whizpoolblogtemp'
config.REGION = 'us-east-1'
config.ACL = 'public-read-write' // 'public-read'
config.ACCESSKEY = 'AKIAJKPAWJAYBJFL224A' 
config.SECRETKEY = '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'


// EMAIL CREDENTIALS
config.MAIL_HOST = 'smtp.gmail.com'
config.MAIL_SECURE = 'ssl'
config.MAIL_USERNAME = 'adelugba.emma@gmail.com'
config.MAIL_PASSWORD = 'temitopeemmanuel'
config.MAIL_FROM = 'adelugba.emma@gmail.com'

//EMAIL TEMPLATES

config.INVOICECREATIONTEMPLATE = "An Invoice has been created in your department"

config.ROUTES_EXCLUDED_FROM_AUTH = ["/test",'','/','/auth','/invoices/uploadFileToS3','/getDownloadUrl','/fetchSignature', '/login', '/register']

// Response Messages
config.VALIDATE_TYPE_OF_DATA_RESP_MSG = "{{RESOURCE}} '{{DATA}}' must be a {{TYPE}}!"
config.OPERATION_SUCCESSFUL_RESP_MSG = 'Operation Successfull!'
config.OPERATION_NOT_SUCCESSFUL_RESP_MSG = 'Operation Not Successfull!'
config.INVOICE_CREATE_SUCCESS_RESP_MSG = 'Invoice Created Successfully!'
config.INVOICE_LISTED_SUCCESS_RESP_MSG = 'Invoice Listed Successfully!'
config.NO_AVAILABLE_INVOICE_RESP_MSG = 'No Available Invoice!'
config.INVOICE_NOT_FOUND_RESP_MSG = "Invoice With ID '{{ID}}' not found!"
config.INVOICE_DETAILS_LISTED_RESP_MSG = "Invoice With ID '{{ID}}' Listed Successfully!"
config.INVOICE_DELETED_RESP_MSG = "Invoice With ID '{{ID}}' Deleted Successfully!"
config.ALL_INVOICE_DELETED_RESP_MSG = 'All Invoices Deleted Successfully!'
config.INPUT_VALIDATION_ERROR = 'Input Validation Error!'
config.MAIL_SENT_RESP_MSG = "Mail Successfully Sent to '{{RECIPIENTS}}'."
config.INVOICE_CLONED_RESP_MSG = "Invoice With ID '{{ID}}' Successfully Cloned!"
config.INVOICE_EXISTS_RESP_MSG = "Invoice with Invoice Number '{{INVOICE_NUMBER}}' already exisits for Recipient Company Name '{{RECIPIENT}}'"

module.exports = config



// RESPONSE CODE
// Success 200
// Error 400
// Not Authorize 403
// Params Required 411
