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

app.io = io

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('static'))

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
app.use('/:id', (req, res) => {
    const resim = fs.readFileSync('./uploads/' + req.params.id)
    res.contentType('image/jpeg');
    res.send(resim)
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