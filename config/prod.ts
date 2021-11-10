let prod = {} as any
// psql -h 18.116.173.28 -d fpinvoiceapp -U postgres -W
prod.DBNAME = "fountainpng_invoicer"
prod.DBUSERNAME="fountainpng_invoicer"
prod.DBPASSWORD="P@ssword123"
prod.DBDIALECT = "mysql"
prod.DBPORT = 3306
prod.DBREGION = 'us-east-1'
prod.DBHOST = '216.194.161.130' //18.116.173.28
prod.PORT = process.env.PORT || 1122
prod.JWTSECRET = 'S74R73RK17'
prod.JWT_EXPIRY_TIME = '1h'
prod.SSL = true
prod.BUCKETNAME = 'bringforthjoy' //'whizpoolblogtemp'
prod.REGION = 'us-east-1'
prod.ACL = 'public-read-write' // 'public-read'
prod.ACCESSKEY = 'AKIAJKPAWJAYBJFL224A' 
prod.SECRETKEY = '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'

// EMAIL CREDENTIALS
prod.MAIL_HOST = 'smtp.gmail.com'
prod.MAIL_SECURE = 'ssl'
prod.MAIL_USERNAME = 'adelugba.emma@gmail.com'
prod.MAIL_PASSWORD = 'temitopeemmanuel'
prod.MAIL_FROM = 'adelugba.emma@gmail.com'

prod.ROUTES_EXCLUDED_FROM_AUTH = ["/test",'','/','/auth','/invoices/uploadFileToS3','/getDownloadUrl','/fetchSignature', '/login', '/register']

// Response Messages
prod.VALIDATE_TYPE_OF_DATA_RESP_MSG = "{{RESOURCE}} '{{DATA}}' must be a {{TYPE}}!"


export default prod



// RESPONSE CODE
// Success 200
// Error 400
// Not Authorize 401
// Params Required 411
