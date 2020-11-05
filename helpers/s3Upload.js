var config = require('../config');
const AWS = require('aws-sdk');
var models = require('../models');

// initiate s3 library from AWS
const s3 = new AWS.S3({
    secretAccessKey: config.SECRETKEY,
    accessKeyId: config.ACCESSKEY
});



async function s3Upload(image,invoiceId) {
    
    const buf = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""),'base64')
    const type = image.split(';')[0].split('/')[1];
    const params = {
            Bucket: 'bringforthjoy', // pass your bucket name
            Key: `home/InvoiceApp/CompanyLogos/${invoiceId}.${type}`, 
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        };
        
    s3.upload(params, function(err, data){
        if (err) { 
            console.log(err);
            console.log('Error uploading data: ', data); 
        } else {
        console.log(`succesfully uploaded the image!- url: ${data.Location}`);
        var logo = { logo: data.Location }
        models.Invoice.update(logo, { where: {id: invoiceId}});
        console.log(`succesfully updated the logo image in the database: ${data.Location}`);
        }
    });
}

async function s3UploadPDF(invoiceId, response, rej) {
    
    const uploadParams = {
      Bucket: config.BUCKETNAME,
      Key: `${Date.now().toString()}-${invoiceId}.pdf`,
      ACL: 'public-read-write',
      Body: response,
    };
    return await s3.upload(uploadParams, (err, data) => {
      if (err) {
          console.log("error", err);
        rej('');
      }
      console.log(`Invoice PDF uploaded successfully at ${data.Location}`);
     return data.Location;
    });
}

module.exports = {
  s3Upload, s3UploadPDF
};