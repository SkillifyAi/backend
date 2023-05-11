const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const base64url = require('base64url');
const moment = require('moment');
require('dotenv').config()


const pathToPubKey = path.join(__dirname, '..', 'id_rsa_pub.pem');

const PRIV_KEY = process.env.PRIV_KEY;
const PUB_KEY = fs.readFileSync(pathToPubKey, 'utf8');

const mongoose = require('mongoose');
const User = mongoose.model('User');

/**
 * -------------- HELPER FUNCTIONS ----------------
 */

/**
 * 
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 * 
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}

/**
 * 
 * @param {*} password - The password string that the user inputs to the password field in the register form
 * 
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 * 
 * ALTERNATIVE: It would also be acceptable to just use a hashing algorithm to make a hash of the plain text password.
 * You would then store the hashed password in the database and then re-hash it to verify later (similar to what we do here)
 */
function genPassword(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };
}


/**
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 */
function issueJWT(user) {
  const _id = user._id;

  const expiresIn = '30 days';

  const payload = {
    sub: _id,
    iat: Date.now()
  };
        

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn
  }
}

function authMiddleware(req, res, next) {

  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: 'You must log in before visiting this route' });
  }
  const tokenParts = token.split(' ')
  if (tokenParts[0] === 'Bearer' && tokenParts[1].match(/\S+\.\S+\.\S+/) !== null) {

    try {
      const verification = jsonwebtoken.verify(tokenParts[1], PUB_KEY, { algorithms: ['RS256'] });
      req.jwt = verification
      next();
    } catch (err) {
      res.status(401).json({ succes: false, msg: "You must log in before visiting this route"})
    }
  }
  else {
    res.status(401).json({ succes: false, msg: "You must log in before visiting this route"})
  }
}

function getPayload (req, res, next) {

    const jwtToken = req.cookies.token.split(' ')[1]
    const jwtParts = jwtToken.split('.')
    const jwtPayload = jwtParts[1]

    const decodedPayload = base64url.decode(jwtPayload)

    const parsedPayload = JSON.parse(decodedPayload)
    
    req.userId = parsedPayload.sub
    
    next()
}

const resetValues = async (req, res, next) => {
  
  try {
    const user = req.user
    const updatedAt = user.updatedAt
    const daysDiff = moment().diff(moment(updatedAt), 'days')
    if(daysDiff >= 30) 
    {
      user.updatedAt = moment().toISOString().replace('Z', '+00:00')
      const planType = user.planType
      if(planType === "Free")
      {
        user.planNumber = 1
      } else if(planType === "Pro")
      {
        user.planNumber = 5
        user.alternativePlans = 1
      } else if(planType === "Premium")
      {
        user.planNumber = 20
        user.alternativePlans = 4
      } else if(planType === "Enterprise")
      {
        user.planNumber = -1
        user.alternativePlans = -1
      }
      await user.save()
    }
    
    res.status(200).json({succes: true, user: req.user})
  } catch (err) {
    res.status(500).json({succes: false, error: err})
  }

}


module.exports.getPayload = getPayload
module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.authMiddleware = authMiddleware;
module.exports.resetValues = resetValues
