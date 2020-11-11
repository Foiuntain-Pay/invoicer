var config = require('../config');
const AWS = require('aws-sdk');
var DB = require('../controllers/DB/db');

// initiate s3 library from AWS
const s3 = new AWS.S3({
    secretAccessKey: config.SECRETKEY ,
    accessKeyId: config.ACCESSKEY
});



async function s3Upload(image,invoiceId) {
    
    const buf = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""),'base64')
    const type = image.split(';')[0].split('/')[1];
    const params = {
            Bucket: config.BUCKETNAME, // pass your bucket name
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
        // models.Invoice.update(logo, { where: {id: invoiceId}});
        console.log(`succesfully updated the logo image in the database: ${data.Location}`);
        }
    });
}

async function s3UploadPDF(invoiceData, response, rej) {
    
    const uploadParams = {
      Bucket: config.BUCKETNAME,
      Key: `${Date.now().toString()}-${invoiceData.InvoiceNumber}.pdf`,
      ACL: config.ACL,
      Body: response,
    };
    return s3.upload(uploadParams, (err, data) => {
      if (err) {
          console.log("error", err);
        rej('');
      }
      // console.log(`Invoice PDF uploaded successfully at ${data.Location}`);
      var pdfData = {
        File: data.Location,
        InvoiceId: invoiceData.id
      }
      DB.invoicePdfs.create(pdfData).then(function(invoicePdf) {
          // console.log("updated the Invoice record with the pdf file location");
          invoiceData.pdfFile = invoicePdf
      });
    //  return data.Location;
    });
}

module.exports = {
  s3Upload, s3UploadPDF
};