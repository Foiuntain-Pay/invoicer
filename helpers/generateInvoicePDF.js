var fs = require('fs');
var path = require('path');
const ejs = require('ejs');
const pdf = require('html-pdf');
const currencies = require('../currencies.json');
const moment = require('moment');
const { s3UploadPDF } = require('./s3Upload.js');
var models = require('../models');

async function generateInvoicePDF(invoiceData, lineItems) {
    
    console.log('invoice ' + invoiceData);
    
    const currencySymbol = currencies.filter(currency => currency.code === invoiceData.Currency)[0].symbolNative;
    const data = {
        invoiceData,
        lineItems,
        currencySymbol,
        moment
    };  
    const gethtmltopdf = async () => {
        try {
            
            const filePathName = path.resolve(__dirname, 'invoicePDF.ejs');
            const htmlString = fs.readFileSync(filePathName).toString();
            let  options = { format: 'A3' };
            const ejsData = ejs.render(htmlString, data);
            return await pdf.create(ejsData, options).toStream((err, response) => {
                if (err) return console.log(err);
                // return response;
                return new Promise((res, rej) => {
                    const uploadedPDF = s3UploadPDF(invoiceData.invoiceNumber, response, rej); // funtion to upload generated pdf to s3 bucket. 
                    console.log('s3upload', uploadedPDF )
                  });
            });
           
        } catch (err) {
            console.log("Error processing request: " + err);
        }
    
    }
    gethtmltopdf();
}

module.exports = {
  generateInvoicePDF
};