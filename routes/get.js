const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Organization = require('../db/Model/Organization.js')

// ! ------ POST------ POST ------ POST ------ POST ------ POST ------ POST------

router.get('/:isletme', (req, res) => {
    const IsletmeId = req.params.isletme
    if (!mongoose.isValidObjectId(IsletmeId))
        return res.json({ ok: false, message: 'İşletme numarası düzgün girilmemiş!' })

    Organization.findById(IsletmeId).select('_id photo username name tables menu settings')
        .then(data => {
            if (!data)
                return res.json({ ok: false, message: IsletmeId + ' numaralı bir işletme bulunamadı!' })
            res.json(data)
        })
})

module.exports = router