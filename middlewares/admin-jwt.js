const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers['token'] || req.body.token || req.query.token

    if (token) {
        jwt.verify(token, process.env.API_SECRET_KEY, (err, decoded) => {
            if (err) {
                res.json({
                    status: false,
                    message: 'TOKEN GEÇERSİZ.'
                })
            } else {
                req.decode = decoded;
                next();
            }
        });
    } else {
        res.json({
            status: false,
            message: 'TOKEN VERİSİ YOK.'
        })
    }
};