var config = {}

config.DBNAME = "invoice-app"
config.DBUSERNAME="emmanueluser"
config.DBPASSWORD="000000"
config.DBDIALECT = "postgres"
config.DBPORT = 5432
config.DBREGION = 'us-east-1'
config.DBHOST = 'manifestdbinstance.cgq0reqixqsd.us-east-1.rds.amazonaws.com'
// config.PORT = process.env.PORT || 1337
config.PORT = 1337
config.USER_MODULE_API_URL = 'https://d5sqweaij8.execute-api.us-east-1.amazonaws.com/UserModuleStageDev2'
config.JWTSECRET = 'P)$TB!)G'
config.JWT_EXPIRY_TIME = '1h'

config.API_NAME = 'module_access'
config.FRONTENDREACTPATH = 'https://manifest-articles-react-app.herokuapp.com'
config.FRONTENDLOGINPATH = '/auth/login'
config.BUCKETNAME = 'bringforthjoy' //'whizpoolblogtemp'
config.REGION = 'us-east-1'
config.ACL = 'public-read-write' // 'public-read'
config.ACCESSKEY = 'AKIAJA77ZS5LOS3M4XZA'  //'AKIAX5356FAXF4F5KFRS'
config.SECRETKEY = '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' //'z84htRSRYwzKEw0LlgsSCjrj8OgY1fOPCgdfIRZR'
// config.CHECKPERMISSION = 'EVERYTIME'
config.CHECKPERMISSION = 'TOKEN'
config.S3_SIGNED_URL_EXPIRYTIME = 3600

config.public_key = 'eoGAfBsXNqr0HxZKFg8pNUVOHyCUjf'
config.private_key = 'U2FsdGVkX1+wNhMouSHUme1M3vSMz0CAsCyMZMOl6Kke230eqhBVlW462jOmmIBc'
config.module_name = '366', //'367'
config.SALT = '7sd!O(!@$*!#*#!a989!!@*#!@#&!^#*!&3hASD987*(#*%$&'
config.authentication_method = 'POST'

// POSTMAN TESTING ONLY
config.authentication_method_PostMan_testing = 'CONFIG'
// config.PORT= process.env.PORT,
config.BASE_URL='https://manifest-articles-ejs-app.herokuapp.com',
config.API_URL= 'https://manifest-articles-api.herokuapp.com',
config.USER_MODULE_URL='https://manifestusermodule.herokuapp.com',
config.SESSIONKEY= 'BL)GAPP$E$$!)N', //BLOGAPPSESSION
config.SESSIONVAR='blogheroku',
config.public_key= 'FpG8aeQolx4Q1FRDaS9wn0b4zpLOXV', //'KAuVRRXSUabpMoU95TzGkYsuEQE9zS',
config.private_key= 'U2FsdGVkX18tZPbd0byGuHyDnpeVQJbMhyHHdNPGnqrogmEc6BTTvNXibe96/0Du', //'U2FsdGVkX19BhPCgN678Dfjd4SO6hAbPg8zW9qpL8YsfNEmxz18DYcSZzjSkM9T3',
config.module_name= 'Blog App EJS',
config.SALT= '7sd!O(!@$*!#*#!a989!!@*#!@#&!^#*!&3hASD987*(#*%$&',
config.authentication_method= 'CONFIG',  //POST
config.JWTSECRET="P)$TB!)G",
config.BUCKETNAME = 'bringforthjoy' //'whizpoolblogtemp'
config.REGION = 'us-east-1'
config.ACL = 'public-read-write' // 'public-read'
config.ACCESSKEY = 'AKIAJA77ZS5LOS3M4XZA'  //'AKIAX5356FAXF4F5KFRS'
config.SECRETKEY = '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' //'z84htRSRYwzKEw0LlgsSCjrj8OgY1fOPCgdfIRZR'
config.S3_SIGNED_URL_EXPIRYTIME = 60 * 60
// END OF POSTMAN TESTING


// EMAIL CREDENTIALS
config.MAIL_HOST = 'smtp.gmail.com'
config.MAIL_SECURE = 'ssl'
config.MAIL_USERNAME = 'babatope.olajide@gmail.com'
config.MAIL_PASSWORD = 'wtdyucsmshylaahb'
config.MAIL_FROM = 'info@manifest.ng'

//EMAIL TEMPLATES

config.INVOICECREATIONTEMPLATE = "An Invoice has been created in your department"

config.ROUTES_EXCLUDED_FROM_AUTH = ["/test",'','/','/auth','/invoices/uploadFileToS3','/getDownloadUrl','/fetchSignature', '/login']

// Response Messages
config.VALIDATE_TYPE_OF_DATA_RESP_MSG = "{{RESOURCE}} '{{DATA}}' must be a {{TYPE}}!"
config.OPERATION_SUCCESSFUL_RESP_MSG = 'Operation Successfull!'
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

module.exports = config



// RESPONSE CODE
// Success 200
// Error 400
// Not Authorize 403
// Params Required 411
