const { send } = require('express/lib/response');
const nodemailer = require('nodemailer')

const SendMail = async (options) => {
    let configuration;

    if (process.env.NODE_ENV === "production") {
        configuration = {
            service: "Gmail",
            auth: {
                user: process.env.PROD_EMAIL_USERNAME,
                pass: process.env.PROD_EMAIL_PASSWORD,
            }
        }
    } else {
        //https://mailtrap.io/inboxes/1672167/messages
        //we have to signup to this website
        //so basically in development mode we do not send emails so we use this fake test email 
        configuration = {
            host: process.env.DEV_EMAIL_HOST,
            port: process.env.DEV_EMAIL_PORT,
            auth: {
                user: process.env.DEV_EMAIL_USERNAME,
                pass: process.env.DEV_EMAIL_PASSWORD
            }
        };
    }

    //1. Create a Transporter
    const transporter = nodemailer.createTransport(configuration);

    //2. Define email options(title,message etc)


    //3. Send Mail
    await transporter.sendMail({
        from: "Gajanan <abc@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message
    })
}


module.exports = SendMail;