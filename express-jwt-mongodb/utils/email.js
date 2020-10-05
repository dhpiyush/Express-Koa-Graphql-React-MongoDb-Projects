const nodeMailer = require('nodemailer');
const config = require('config');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email{
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = 'Piyush <piyush@gmail.com>';
    }

    newTransport(){
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: config.get('send-grid-username'), //apikey
                    password: config.get('send-grid-password') //key
                    // create account on app.sendgrid.com
                    }
                });
        }

        return nodemailer.createTransport({
        service: 'Gmail',
        host: config.get('host'),
        port: config.get('port'),
        auth: {
            user: config.get('email-username'),
            password: config.get('email-password')
            // Activate in gmail "less secure app" option
            // https://mailtrap.io/ for dev
            }
        });
    }

    async send(template, subject){
        // render HTML template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstname: this.firstname,
            url: this.url,
            subject
        });

        //define email options
        const mailOptions = {
            from : this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };

        //create a transport and send mail
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        // Welcome is the template in views/email
        await this.send('welcome', 'weclome to natours family');
    }

    async sendPasswordReset(){
        await this.send('passwordResetEmail', 'Reset Password');
    }
}



module.exports = Email;