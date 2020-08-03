const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Organization = require('../db/Model/Organization.js')
const tokenVerify = require('../helpers/jwt').verify

// ! ------ POST------ POST ------ POST ------ POST ------ POST ------ POST------

router.post('/', tokenVerify, (req, res) => {
    const { No } = req.body
    if (!No)
        return res.error('No alanı boş olamaz')
    if (typeof No != 'number')
        return res.error('Geçersiz No')

    Organization.findById(req.AuthData, 'tables')
        .then(data => {
            const masa = data.tables.find(x => x.No == No)
            if (masa)
                return res.error(`${No} numaralı masa zaten var.`)

            data.tables.push({ No })
            data.save()
                .then(data => {
                    if (!data)
                        return res.error('', { message: 'Masa eklerken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })
                    res.json({ ok: true })
                })
                .catch(err => {
                    return res.error(err.message)
                })
        })
        .catch(err => {
            res.error('', err)
        })
})

router.put('/:id', tokenVerify, (req, res) => {
    const Id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(Id))
        return res.error('Geçersiz Id')

    const { No } = req.body
    if (!No)
        return res.error('No alanı boş olamaz')
    if (typeof No != 'number')
        return res.error('Geçersiz No')

    Organization.findOneAndUpdate({ _id: req.AuthData, 'tables._id': Id }, { $set: { 'tables.$.No': No } }, { new: true, runValidators: true })
        .then(data => {
            if (!data)
                return res.error('Masa bulunamadı')
            return res.json({ ok: true })
        })
        .catch(err => {
            res.error('', err)
        })

})

router.delete('/:id', tokenVerify, (req, res) => {
    const Id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(Id))
        return res.error('Geçersiz Id')

    Organization.findOneAndUpdate({ _id: req.AuthData, 'tables._id': Id }, { $pull: { 'tables': { _id: Id } } }, { runValidators: true }).select('-_id tables')
        .then(data => {
            if (!data)
                return res.error('Masa Bulunamadı')

                res.json({ ok: true })

        })
})

module.exports = router
