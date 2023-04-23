const authentificate = (req, res, next) => {
    const token = req.cookies.token

    if(!token)
        return res.status(200).json({succes: true, token: false})
    
    next()
}


module.exports.authentificate = authentificate
