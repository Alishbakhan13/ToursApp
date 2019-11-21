const mailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstname = user.name.split(' ')[0];
        this.url = url;
        this.from = process.env.EMAIL_FROM;
    }

    newTransport() {
        if (process.env.NODE_ENV) {
            // eslint-disable-next-line no-empty
            return mailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SendGrind_USERNAME,
                    pass: process.env.SendGrind_Password
                }
            });
        } else {
            return mailer.createTransport({
                host: 'smtp.mailtrap.io',
                port: 2525,
                auth: {
                    user: '40967eed93f4f1',
                    pass: '610838536b2174'
                }
            });
        }
    }
    async send(template, subject) {
        // render the html
        const html = pug.renderFile(`${__dirname}/../views/email/${template}`, {
            firstname: this.firstname,
            url: this.url,
            subject
        });

        //define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            // converting the html into text
            text: htmlToText.fromString(html)
        };

        return await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome.pug', 'welcome to natrous ');
    }

    async passwordRest() {
        await this.send('passwordReset.pug', 'Reset your password (resepond within 10  minutes)');
    }
};
/*  simple test for sending email 
module.exports = async options => {
    //   Create transporter
    const transport = mailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: '40967eed93f4f1',
            pass: '610838536b2174'
        }
    });

    //define email options
    let mailOptions = {
        from: 'alishbakhan48191@yahoo.com',
        to: options.email,
        subject: options.subject,
        text: options.message
    };
    console.log(mailOptions);
    // sending the mail
    await transport.sendMail(mailOptions);
};
*/
