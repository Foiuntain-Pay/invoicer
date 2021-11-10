import config from '../config/config';
import AWS from 'aws-sdk';
import DB from '../controllers/DB/db';
import { ReadStream } from 'fs';

// initiate s3 library from AWS
const s3 = new AWS.S3({
    secretAccessKey: config.SECRETKEY ,
    accessKeyId: config.ACCESSKEY
});



async function s3Upload(image: string,invoiceId: any) {
    
    const buf = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""),'base64')
    const type = image.split(';')[0].split('/')[1];
    const params = {
            Bucket: config.BUCKETNAME, // pass your bucket name
            Key: `home/InvoiceApp/CompanyLogos/${invoiceId}.${type}`, 
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        };
        
    s3.upload(params, function(err: any, data: { Location: any; }){
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

async function s3UploadPDF(invoiceData: { currency?: string; invoiceNumber?: any; id?: any; pdfFile?: any; }, response: ReadStream, rej: { (reason?: any): void; (arg0: string): void; }) {
    
    const uploadParams = {
      Bucket: config.BUCKETNAME,
      Key: `${Date.now().toString()}-${invoiceData.invoiceNumber}.pdf`,
      ACL: config.ACL,
      Body: response,
    };
    return s3.upload(uploadParams, (err: any, data: { Location: any; }) => {
      if (err) {
          console.log("error", err);
        rej('');
      }
      // console.log(`Invoice PDF uploaded successfully at ${data.Location}`);
      var pdfData = {
        file: data.Location,
        invoiceId: invoiceData.id
      }
      DB.invoicePdfs.create(pdfData).then(function(invoicePdf: any) {
          // console.log("updated the Invoice record with the pdf file location");
          invoiceData.pdfFile = invoicePdf
      });
    //  return data.Location;
    });
}

export {s3Upload, s3UploadPDF}