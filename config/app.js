const express = require('express')
const app = express()
const sharp = require('sharp')

const ErrorLog = require('../db/Model/ErrorLog.js')
const Photo = require('../db/Model/Photo.js');

module.exports = app

app.io = require("./socket").io

app.response.error = function (message, err) {
    if (message == '')
        message = 'Bilinmeyen Hata'
    if (err) {
        console.log('Hata Meydana Geldi')
        new ErrorLog({
            path: this.req.originalUrl,
            method: this.req.method,
            reqData: {
                Headers: this.req.headers,
                Body: this.req.body
            },
            error: err,
            message: err.message
        }).save()
    }
    console.log('ERROR DONDURULDU', message)
    return this.status(500).send({ ok: false, message })
}

async function OptimizeEt(photo) {
    return await sharp(photo)
        .clone()
        .jpeg({ quality: 80 })
        .toBuffer()
}

app.response.ResimYukle = (image) => {
    return new Promise(async (resolve, reject) => {
        if (!image)
            return reject({ ok: false, msg: "Resim Gönderilmemiş" })

        image = await OptimizeEt(image.buffer)

        const foto = new Photo({ photo: image })
        foto.save()
            .then(data => resolve({ ok: true, data: data._id }))
            .catch(err => reject({ ok: false, msg: err }))
    })
}

app.response.ResimSil = function (id) {
    Photo.findByIdAndDelete(id)
        .then(ok => { })
        .catch(err => { })
}

app.response.ResimDegistir = (id, image) => {
    return new Promise((resolve, reject) => {
        if (!image)
            return reject({ ok: false, msg: "Resim Gönderilmemiş" })

        OptimizeEt(image.buffer)
            .then(data => {
                Photo.findByIdAndUpdate(id, { photo: data })
                    .then(data => resolve({ ok: true, data: data._id }))
                    .catch(err => reject({ ok: false, msg: err.message }))
            })
    })
}