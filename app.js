require('dotenv').config()
const cors = require('cors')
const fs = require('fs')
const express = require('express')

// Database Connections, Models
require('./db/connection.js')()
const Photo = require('./db/Model/Photo.js');

const app = require("./config/app")
const server = require("./config/socket").server

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('static'))
app.use(cors())

const orgRoute = require('./routes/org')
const catRoute = require('./routes/cat')
const proRoute = require('./routes/pro')
const ordRoute = require('./routes/ord');
const tabRoute = require('./routes/tab');
// const getRoute = require('./routes/get');

app.use('/org', orgRoute)
app.use('/cat', catRoute)
app.use('/pro', proRoute)
app.use('/ord', ordRoute)
app.use('/tab', tabRoute)
// app.use('/get', getRoute)
app.get('/photos/:id', (req, res) => {
    switch (req.params.id) {
        case "ornekOrganization":
            res.contentType('image/jpeg');
            return res.send(fs.readFile("./uploads/ornekOrganization"), (err, data) => {
                if (err) throw err;
                return data
            })

        case "ornekCategory":
            res.contentType('image/jpeg');
            return res.send(fs.readFile("./uploads/ornekCategory"), (err, data) => {
                if (err) throw err;
                return data
            })

        case "ornekProduct":
            res.contentType('image/jpeg');
            return res.send(fs.readFile("./uploads/ornekProduct"), (err, data) => {
                if (err) throw err;
                return data
            })
    }


    Photo.findById(req.params.id)
        .then(data => {
            res.contentType('image/jpeg');
            if (!data) {
                return res.send(fs.readFile("./uploads/null"), (err, data) => {
                    if (err) throw err;
                    return data
                })
            }
            res.send(data.photo)
        })
        .catch(err => res.json({ ok: false }))
})

server.listen(process.env.PORT, () => console.log(`http://localhost:${process.env.PORT}`))

module.exports = app