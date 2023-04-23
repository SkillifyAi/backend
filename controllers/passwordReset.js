const mongoose = require('mongoose');
const User = mongoose.model('User')
const { issueJWT } = require('./utils');
const { genPassword } = require('./utils');
const base64url = require('base64url')
const moment = require('moment');
const sendEmail = require('./sendEmail')

const isExpired = (resetToken) => {
    const tokenParts = resetToken.split('.')
    const payload = tokenParts[1]
    const decodedPayload = base64url.decode(payload)

    const parsedPayload = JSON.parse(decodedPayload)

    const createdAt = moment(parsedPayload.iat)
   
    if(moment().diff(createdAt, 'hours') >= 1)
        return true
    return false
}



const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if(!user)
            return res.status(404).json({succes: false, message: "User with given email does not exist!"})
        const resetToken = issueJWT(user);
        const token = resetToken.token.split(" ")[1]

        try {
            await sendEmail(req.body.email, user.username, token);
            user.resetToken = token
            await user.save()
            res.status(200).json({succes: true, message: "Email sent successfully"})
        } catch (err) {
            res.status(500).json({succes: false, message: "Email sending failed"})
        }  
    } catch (err) {
        return res.status(500).json({succes: false, message: err})
    }  
}

const resetPassword = async (req, res) => {
    
    try {
        const {token} = req.query
        const user = await User.findOne({resetToken: token})
        if(!user)
            return res.status(400).json({succes: false, message: "Invalid token"})
        if(isExpired(token))
        {   
            user.token = ""
            await user.save()
            return res.status(400).json({succes: false, message: "Your token has expired"})
        }
           

        const {salt, hash} = genPassword(req.body.password)
        
        user.salt = salt
        user.hash = hash
        user.token = ""
        await user.save()
        res.status(200).json({succes: true, message: "Password reset was successfull"})
    } catch (err){
        return res.status(500).json({succes: false, message: err})
    }
}

module.exports = {
    forgotPassword,
    resetPassword
}