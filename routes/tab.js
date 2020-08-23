const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Organization = require('../db/Model/Organization.js')
const tokenVerify = require('../helpers/jwt').verify

// ! ------ POST------ POST ------ POST ------ POST ------ POST ------ POST------

router.get('/:org/:masa', (req, res) => {
    let { org, masa } = req.params
    if (!org || !masa)
        return res.error('İşletme veya masa alanı boş olamaz')
    if (!mongoose.Types.ObjectId.isValid(org))
        return res.error('Geçersiz İşletme Id`si')
    masa = Number(masa)
    if (typeof masa != 'number')
        return res.error('Geçersiz masa numarası')

    Organization.findById(org, 'tables')
        .then(data => {
            const _masa = data.tables.find(x => x.No == masa)
            if (!_masa)
                return res.error('Böyle bir masa yok')
            if (_masa)
                return res.json({ ok: true, masa })
        })
        .catch(err => {
            res.error('', err)
        })
})

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

router.post('/many', tokenVerify, (req, res) => {
    const { No } = req.body
    if (!No)
        return res.error('No alanı boş olamaz')
    if (typeof No != 'number')
        return res.error('Geçersiz No')

    Organization.findById(req.AuthData, 'tables')
        .then(data => {
            data.tables = []
            for (let i = 1; i <= No; i++) {
                data.tables.push({ No: i })
            }
            data.save()
                .then(data => {
                    if (!data)
                        return res.error('', { message: 'Çoklu masa eklerken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })
                    res.json({ ok: true, last: No })
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
    if (typeof Id == !'number')
        return res.error('Geçersiz Id')

    const { No } = req.body
    if (!No)
        return res.error('No alanı boş olamaz')
    if (typeof No != 'number')
        return res.error('Geçersiz No')

    Organization.findOneAndUpdate({ _id: req.AuthData, 'tables.No': Id }, { $set: { 'tables.$.No': No } }, { new: true, runValidators: true })
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
    const No = Number(req.params.id)
    if (typeof No != 'number')
        return res.error('Geçersiz No')

    Organization.findOneAndUpdate({ _id: req.AuthData, 'tables.No': No }, { $pull: { 'tables': { No } } }, { runValidators: true }).select('-_id tables')
        .then(data => {
            if (!data)
                return res.error('Masa Bulunamadı')

            res.json({ ok: true })

        })
})

module.exports = router
