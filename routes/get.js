const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Organization = require('../db/Model/Organization.js')

const nodemailer = require("nodemailer");

// ! ------ POST------ POST ------ POST ------ POST ------ POST ------ POST------


router.post('/new', async (req, res) => {
    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
        host: "mail.akillimenum.com",
        port: 25,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'destek@akillimenum.com', // generated ethereal user
            pass: '2691582efe', // generated ethereal password
        },
    });

    // verify connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log("Server is ready to take our messages");
        }
    });

    let info = await transporter.sendMail({
        from: 'erdemefesteam2@hotmail.com', // sender address
        to: "erdemefesteam2@hotmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.send('ok')
})

// router.get('/:isletme', (req, res) => {
//     const IsletmeId = req.params.isletme
//     if (!mongoose.isValidObjectId(IsletmeId))
//         return res.json({ ok: false, message: 'İşletme numarası düzgün girilmemiş!' })

//     Organization.findById(IsletmeId).select('_id photo username name tables menu settings')
//         .then(data => {
//             if (!data)
//                 return res.json({ ok: false, message: IsletmeId + ' numaralı bir işletme bulunamadı!' })
//             res.json(data)
//         })
// })

module.exports = router