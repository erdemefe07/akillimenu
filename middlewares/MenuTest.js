const validator = require('validator');

module.exports = (req, res, next) => {
    message = [];

    const { Ad, Fiyat, Kalori, Hazirlanma_Suresi, Aciklama } = req.body;

    if (!validator.isByteLength(Ad, { min: 2, max: 200 }))
        message.push("Ad Alanı Geçersiz.");

    if (!validator.isFloat(Fiyat.toString(), { min: 0.00, max: 9999.99 }))
        message.push("Fiyat Alanı Geçersiz.");

    if (!validator.isInt(Kalori.toString(), { min: 0, max: 9999 }))
        message.push("Kalori Alanı Geçersiz.");

    if (!validator.isInt(Hazirlanma_Suresi.toString(), { min: 0, max: 60 }))
        message.push("Hazırlanma Süresi Alanı Geçersiz.");

    if (!validator.isByteLength(Aciklama, { min: 0, max: 2000 }))
        message.push("Açıklama Alanı Geçersiz.");

    if (message.length > 0) {
        console.log(message)
        return res.send({
            status: false,
            message
        })
    }

    next();
};