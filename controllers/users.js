const mongoose = require('mongoose');
const utils = require('./utils')
const User = mongoose.model('User');
const moment = require('moment')


const handleLogin = async (req, res, next) => {

    if(req.cookies.token) {
        res.status(400).json({succes: false, error: "You are already logged in"})
        return 
    } 

    try {
        const user = await User.findOne({email: req.body.email})
        if(!user)
            return res.status(401).json({succes: false, error: "Could not find user"})

        const isValid = utils.validPassword(req.body.password, user.hash, user.salt)

        if(isValid) {
            const jwt = utils.issueJWT(user)
            const jwtTimeParts = jwt.expires.split(" ")
            const expiryTime = moment().add(jwtTimeParts[0], jwtTimeParts[1]).toDate()
        
            res.cookie('token', jwt.token, {
                expires:  expiryTime,
                httpOnly: true,
                secure: false
            })
            
            req.user = user
            next()  
        } else {
            return res.status(401).json({succes: false, error: "Invalid password"})
        }   
    } catch(err) {
        return res.status(500).json({succes: false, error: err})
    }

}

const handleGoogleLogin = async (req, res , next) => {
    if(req.cookies.token) {
        return res.status(400).json({succes: false, error: "You are already logged in"})    
    } 

    try {
        const user = await User.findOne({email: req.body.email})
        if(user)
        {
            const jwt = utils.issueJWT(user)
            const expiryTime = moment().add(jwt.expires[0] + jwt.expires[1], 'days').toDate()
        
            res.cookie('token', jwt.token, {
                expires:  expiryTime,
                httpOnly: true,
                secure: false
            })
            user.image = req.body.picture
            await user.save()
            return res.status(200).json({succes: true, user: user})
        }
        const newUser = new User({
            username: req.body.name,
            email: req.body.email,
            image: req.body.picture
        })
        const newUserData = await newUser.save()
        const jwt = utils.issueJWT(newUserData)

        console.log(jwt.expires[0] + jwt.expires[1]);
        const expiryTime = moment().add(jwt.expires[0] + jwt.expires[1], 'days').toDate()
        
        res.cookie('token', jwt.token, {
            expires:  expiryTime,
            httpOnly: true,
            secure: false
        })

        return res.status(200).json({succes: true, user: newUserData})

    } catch (err) {
        return res.status(500).json({succes: false, error: err})
    }

}

const handleRegister = async (req, res, next) => {

    if(req.cookies.token) {
        return res.status(400).json({succes: false, error: "You can`t create an account while you are logged in"})    
    } 
   
    try {
        const user = await User.findOne({email: req.body.email})
        if(user){
            return res.status(400).json({succes: false, error: "User already exists"})
        }       
        
    } catch (err) {
        return res.status(500).json({succes: false, error: err})
    }

    
    return res.status(200).json({succes: true})
    
    
}

const handleLogOut = async (req, res) => {

    try {   
        await res.clearCookie('token')
        res.status(200).json({succes: true})
    } catch (err) {
        res.status(500).json({succes: false, error: err})
    }
} 

const sendData = async (req, res) => {

    try {
        const user = await User.findById(req.userId)

        const plansCompleted = user.plansCompleted
        const userPlace = await User.countDocuments({ plansCompleted: { $gt: plansCompleted } });
        const userData = {
            email: user.email,
            username: user.username,
            planType: user.planType,
            planNumber: user.planNumber,
            plansCompleted: user.plansCompleted,
            image: user.image
        }
        res.status(200).json({succes: true, user: userData, userPlace: userPlace + 1})
    }
    catch (err) {
        res.status(500).json({succes: false, error: err})
    }
}

const getLeaderboard = async (req, res, next) => {
    try {

        const users = await User.find().sort({plansCompleted: -1}).skip(req.query.skip).limit(req.query.limit)

        const usersData = users.map(obj => ({
            email:obj.email,
            name: obj.username,
            nrPlans: obj.plansCompleted,
            image: obj.image, 
        }))
        res.status(200).json({succes: true, users: usersData, totalPlans: users.length})
    } catch (err) {
        res.status(500).json({succes: false, error: err})
    }
}
module.exports = {
    handleLogin,
    handleRegister,
    handleLogOut,
    sendData,
    getLeaderboard,
    handleGoogleLogin
}