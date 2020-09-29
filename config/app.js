const express = require('express')
const app = express()
const { s3upload, s3delete } = require('../helpers/aws-s3/')

const ErrorLog = require('../db/Model/ErrorLog.js')
const Photo = require('../db/Model/Photo.js');

module.exports = app

app.io = require("./socket").io

app.response.error = function (message, err) {
    if (message == '')
        message = 'Bilinmeyen Hata'
    if (err) {
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
    return this.status(500).send({ ok: false, message })
}

app.response.ResimYukle = (image) => {
    return new Promise((resolve, reject) => {
        if (!image)
            return reject({ ok: false, msg: "Resim Gönderilmemiş" })

        resolve({ ok: true, data: s3upload(image.buffer) })
    })
}

app.response.ResimSil = function (id) {
    s3delete(id)
}

app.response.ResimDegistir = (id, image) => {
    return new Promise((resolve, reject) => {
        if (!image)
            return reject({ ok: false, msg: "Resim Gönderilmemiş" })

        resolve({ ok: true, data: s3upload(image.buffer, id) })
    })
}