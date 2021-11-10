import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import pdf from 'html-pdf';
import currencies from './currencies';
import moment from 'moment';
import {s3UploadPDF} from './s3Upload';
// var models = require('../models');

async function generateInvoicePDF(invoiceData: { currency: string; }, items:any, businessData: any, clientData: any) {
    
    const currencySymbol = currencies.filter(currency => currency.code === invoiceData.currency)[0].symbolNative;
    const data = {
        invoiceData,
        items,
        businessData,
        clientData,
        currencySymbol,
        moment
    } as any;  
    const gethtmltopdf = async () => {
        try {
            
            const filePathName = path.resolve(__dirname, 'invoicePDF.ejs');

            const htmlString = fs.readFileSync(filePathName).toString();
            let  options: any = { format: 'A3' };
            const ejsData: any = ejs.render(htmlString, data);
            return pdf.create(ejsData, options).toStream((err, response) => {
                if (err)
                    return console.log(err);
                // return response;
                return new Promise((res, rej) => {
                    s3UploadPDF(invoiceData, response, rej); // funtion to upload generated pdf to s3 bucket. 
                });
            });
           
        } catch (err) {
            console.log("Error processing request: " + err);
        }
    
    }
    gethtmltopdf();
}
export {generateInvoicePDF};