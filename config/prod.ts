let prod = {} as any
// psql -h 18.116.173.28 -d fpinvoiceapp -U postgres -W
prod.DBNAME = process.env.DBNAME
prod.DBUSERNAME= process.env.DBUSERNAME
prod.DBPASSWORD= process.env.DBPASSWORD
prod.DBDIALECT = process.env.DBDIALECT
prod.DBPORT = process.env.DBPORT
prod.DBREGION = process.env.DBREGION
prod.DBHOST = process.env.DBHOST //18.116.173.28
prod.PORT = process.env.PORT || 1122
prod.JWTSECRET = process.env.JWTSECRET
prod.JWT_EXPIRY_TIME = process.env.JWT_EXPIRY_TIME
prod.SSL = process.env.SSL
prod.BUCKETNAME = process.env.BUCKETNAME //'whizpoolblogtemp'
prod.REGION = process.env.REGION
prod.ACL = process.env.ACL // 'public-read'
prod.ACCESSKEY = process.env.ACCESSKEY
prod.SECRETKEY = process.env.SECRETKEY

// EMAIL CREDENTIALS
prod.MAIL_HOST = process.env.MAIL_HOST
prod.MAIL_SECURE = process.env.MAIL_SECURE
prod.MAIL_USERNAME = process.env.MAIL_USERNAME
prod.MAIL_PASSWORD = process.env.MAIL_PASSWORD
prod.MAIL_FROM = process.env.MAIL_FROM

prod.ROUTES_EXCLUDED_FROM_AUTH = ["/test",'','/','/auth','/invoices/uploadFileToS3','/getDownloadUrl','/fetchSignature', '/login', '/register']

// Response Messages
prod.VALIDATE_TYPE_OF_DATA_RESP_MSG = process.env.VALIDATE_TYPE_OF_DATA_RESP_MSG


export default prod



// RESPONSE CODE
// Success 200
// Error 400
// Not Authorize 401
// Params Required 411
