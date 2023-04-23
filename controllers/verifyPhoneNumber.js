const twilio = require('twilio')
require('dotenv').config()
const mongoose = require('mongoose');
const User = mongoose.model('User')
const utils = require('./utils')
const moment = require('moment')

const sendNumber = async (req, res) => {
   
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken)
    const number = req.body.phoneNumber;
    try {
        const user = await User.findOne({phoneNumber: number})
        if(user)
            return res.status(400).json({succes: false, message: "This phone number is already linked to an existing account"})
    } catch (err) {
        return res.status(500).json({succes: false, message: err})
    }
    

    client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
                    .verifications
                    .create({to: number, channel: 'sms'})
                    .then(verification_check => {     
                        console.log(verification_check); 
                        res.status(200).json({succes: true, message: "Code sent"})
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({succes: false, message: "Failed to send verification code"})
                    })  
                
}


const verifyNumber = (req, res) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken)
    const code = req.body.code

    client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks
      .create({to: req.body.number, code: code})
      .then(async (verification_check) => {
        console.log(verification_check);
        if(verification_check.status === "approved")
        {    
            const saltHash = utils.genPassword(req.body.password)

            const salt = saltHash.salt
            const hash = saltHash.hash

            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                hash: hash,
                salt: salt,
                phoneNumber: req.body.number
            })
            try {
                const user = await newUser.save()
                const jwt = utils.issueJWT(user)
        
                const jwtTimeParts = jwt.expires.split(" ")
        
                const expiryTime = moment().add(jwtTimeParts[0], jwtTimeParts[1]).toDate()
        
                res.cookie('token', jwt.token, {
                    expires:  expiryTime,
                    httpOnly: true,
                    secure: false
                })
        
                return res.status(200).json({succes: true, user: user})
            } catch (err) {
                console.log(err);
                return res.status(500).json({succes: false, error: err})
            }
            
        }  
        else 
            res.status(400).json({succes: false, message: "Verification code is incorrect"})
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({succes: false, message: err})
      })
}

module.exports = {
    sendNumber,
    verifyNumber
} 