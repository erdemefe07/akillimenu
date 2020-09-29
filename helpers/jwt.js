const jwt = require('jsonwebtoken');
const Tokens = require('../db/RedisModel/Tokens')

module.exports.verify = async (req, res, next) => {
    try {
        const token = req.headers.token;
        const decoded = jwt.verify(token, process.env.API_SECRET_KEY)

        const storedToken = await Tokens.get(decoded.Id)
        if (storedToken == token) {
            req.AuthData = decoded.Id;
            next()
        }
        else{
            res.error('İşletme bulunamadı')
        }
    } catch (error) {
        console.log("module.exports.verify -> error", error)
        return res.error('Kimlik doğrulama başarısız', error)
    }
}


module.exports.sign = (Id) => {
    return new Promise((resolve, reject) => {
        try {
            jwt.sign({ Id }, process.env.API_SECRET_KEY, function (err, decoded) {
                if (err)
                    reject(err)
                resolve(decoded)
            })
        } catch (error) {
            return res.error('Kimlik doğrulama başarısız')
        }
    })

}