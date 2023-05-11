const nodemailer = require('nodemailer');
require('dotenv').config()
const {google} = require('googleapis')
const OAuth2 = google.auth.OAuth2


const sendMail = async (transporter, mailOptions) => {
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.log('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}

const createGmailTransport = async () => {

    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID, // Client ID
        process.env.CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
    )

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    })

    const accessToken = await new Promise((resolve, rejet) => {
        oauth2Client.getAccessToken((err, token) => {
            if(err) {
                rejet('Failed to get acces token: ' + err)
            } else {
                resolve(token)
            }
        })
    })

    return gmailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USERNAME,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessToken
        }
      });
}

const sendEmail = async (userEmail, username, resetToken) => {

    const gmailTransport = await createGmailTransport()
    
    const outlookTransport = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: process.env.OUTLOOK_USERNAME,
            pass: process.env.OUTLOOK_PASSWORD
        }
    });
    
    const yahooTransporter = nodemailer.createTransport({
        service: 'yahoo',
        auth: {
            user: process.env.YAHOO_USERNAME,
            pass: process.env.YAHOO_PASSWORD
        }
    });
  
    function getTransport(userEmail) {  
        if (userEmail.endsWith('@gmail.com')) {
            return gmailTransport;
        } else if (userEmail.endsWith('@outlook.com')) {
            return outlookTransport;
        } else if(userEmail.endsWith('@yahoo.com'))
            return yahooTransporter;
        else {
          console.log('Unsupported email service');
        }
    }
    const transporter =  getTransport(userEmail)

    const emailHtml = 
    `   
    <html>
    <head>
    </head>
    <body>
        <table style="width: 100%; height: 400px; background-color: #ddd;">
            <tr>
                <td align="center" valign="middle">
                    <table style="background-color: white; height:200px; width:30%; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.3); padding: 20px;">
                    <tr>
                        <td align="center" style="color: black; font-size: 16px;">
                        Dear ${username}<br><br>
                        Please click the link below to reset your password:<br><br>
                        <a style="background-color: #f78000; border-radius: 10px; padding: 20px; font-weight: 700; color: white; text-decoration: none;" href = "${process.env.FRONTEND_URL}reset-password/${resetToken}">Password reset</a><br><br>
                        Skillify Ai
                        </td>
                    </tr>
                    </table>
                    <br>
                    <a style="text-decoration: none; color: black; opacity: 0.5; font-size: 12px;" href="https://skillify-ai.com/">https://skillify-ai.com</a>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `
    const emailOptions = {
        from: 'Skillify <skillify.ai@outlook.com>',
        to: userEmail,
        subject: 'Skillify Ai Reset Your Password',
        html: emailHtml,
    }
    
    try {
        const info = await sendMail(transporter, emailOptions)
        console.log(info);
        return info
    } catch (err) {
        console.log(err);
        throw new Error("Failed to send email")
    }

}

module.exports = sendEmail
