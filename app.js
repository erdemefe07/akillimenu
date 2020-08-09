require('dotenv').config()
const cors = require('cors')
const fs = require('fs');

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
    return this.status(500).send({ ok: false, message })
}

const Photo = require('./db/Model/Photo.js');

app.response.ResimYukle = (image) => {
    return new Promise((resolve, reject) => {
        if (!image)
            return reject({ ok: false, msg: "Resim Gönderilmemiş" })

        image = image.buffer

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

        image = image.buffer

        Photo.findByIdAndUpdate(id, { photo: image })
            .then(data => resolve({ ok: true, data: data._id }))
            .catch(err => reject({ ok: false, msg: err.message }))
    })
}


app.io = io

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('static'))

const orgRoute = require('./routes/org')
const catRoute = require('./routes/cat')
const proRoute = require('./routes/pro')
const ordRoute = require('./routes/ord');
const tabRoute = require('./routes/tab');

const multer = require('multer')
const upload = multer({
    limits: { fileSize: 2097152 }, fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
})

app.get('/test', upload.single('photo'), (req, res) => {

})
app.use('/org', orgRoute)
app.use('/cat', catRoute)
app.use('/pro', proRoute)
app.use('/ord', ordRoute)
app.use('/tab', tabRoute)
app.get('/photos/:id', (req, res) => {
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


// ------------ EASIQL ------------ \\

// const maintains = {
//     'Organization': {
//         fields: ['name', 'email', '_id'],
//         resolver: () => {
//             return Organization.find().then(data => data)
//         }
//     }
// }

// app.use(async (req, res, next) => {
//     const reso = req.body.org
//     const wants = req.body.fields
//     if (reso == 'Organization') {
//         const returned = await maintains.Organization.resolver()

//         const aio = []
//         if (Array.isArray(returned)) {
//             for (let i = 0; i < returned.length; i++) {
//                 const item = {}
//                 for (let j = 0; j < wants.length; j++)
//                     item[wants[j]] = returned[i][wants[j]]
//                 aio.push(item)
//             }
//         }
//         res.json(aio)

//     }

// })