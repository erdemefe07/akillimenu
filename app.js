require('dotenv').config()
const cors = require('cors')
const fs = require('fs')
const express = require('express')

// Database Connections, Models
require('./db/connection.js')()

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