require('dotenv').config()
const cors = require('cors')
const fs = require('fs')
const sharp = require('sharp')

// Database Connections, Models
require('./db/connection.js')()
const jwt = require('jsonwebtoken');
const ErrorLog = require('./db/Model/ErrorLog.js')
const Tokens = require('./db/redis')

const express = require('express')
const app = express()
app.use(cors())
const server = require('http').createServer(app);

const io = require('socket.io')(server);

io.on('connection', socket => {
    let token = socket.handshake.query.token;
    try {
        jwt.verify(token, process.env.API_SECRET_KEY, async (err, data) => {
            if (err)
                return socket.disconnect()

            if (!data)
                return socket.disconnect()

            const storedToken = await Tokens.get(data.Id)
            if (storedToken == token)
                socket.join(data.Id)
            else {
                return socket.disconnect()
            }
        })
    } catch (error) {
        console.log(error)
    }
});

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

const Photo = require('./db/Model/Photo.js');

function OptimizeEt(photo) {
    return sharp(photo)
        .clone()
        .jpeg({ quality: 80 })
        .toBuffer()
}

app.response.ResimYukle = (image) => {
    return new Promise((resolve, reject) => {
        if (!image)
            return reject({ ok: false, msg: "Resim Gönderilmemiş" })

        image = OptimizeEt(image.buffer)

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

app.io = io

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('static'))
app.use(cors())

const orgRoute = require('./routes/org')
const catRoute = require('./routes/cat')
const proRoute = require('./routes/pro')
const ordRoute = require('./routes/ord');
const tabRoute = require('./routes/tab');

app.use('/org', orgRoute)
app.use('/cat', catRoute)
app.use('/pro', proRoute)
app.use('/ord', ordRoute)
app.use('/tab', tabRoute)
app.get('/photos/:id', (req, res) => {
    switch (req.params.id) {
        case "ornekOrganization":
            res.contentType('image/jpeg');
            return res.send(fs.readFileSync("./uploads/ornekOrganization"))

        case "ornekCategory":
            res.contentType('image/jpeg');
            return res.send(fs.readFileSync("./uploads/ornekCategory"))

        case "ornekProduct":
            res.contentType('image/jpeg');
            return res.send(fs.readFileSync("./uploads/ornekProduct"))
    }


    Photo.findById(req.params.id)
        .then(data => {
            if (!data)
                return res.json({ ok: false })
            res.contentType('image/jpeg');
            res.send(data.photo)
        })
        .catch(err => res.json({ ok: false }))
})

server.listen(process.env.PORT, () => console.log(`http://localhost:${process.env.PORT}`))

module.exports = app