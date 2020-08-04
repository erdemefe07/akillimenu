const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Organization = require('../db/Model/Organization.js')
const tokenVerify = require('../helpers/jwt').verify
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const upload = multer({ dest: 'uploads/', limits: { fileSize: 2097152 } })

router.get('/:org/:cat/:id', (req, res) => {
    const org = req.params.org
    const cat = req.params.cat
    const Id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(org))
        return res.error('Geçersiz İşletme Id`si')

    if (!mongoose.Types.ObjectId.isValid(cat))
        return res.error('Geçersiz Kategori Id`si')

    if (!mongoose.Types.ObjectId.isValid(Id))
        return res.error('Geçersiz Ürün Id`si')

    Organization.findById(org, '-_id menu')
        .then(data => {
            if (!data)
                return res.error('İşletme bulunamadı')

            const category = data.menu.find(x => x._id == cat)
            if (!category)
                return res.error('Kategori bulunamadı')

            const product = category.products.find(x => x._id == Id)
            if (!product)
                return res.error('Ürün bulunamadı')

            res.json(product)
        })
        .catch(err => {
            res.error('', err)
        })
})

router.post('/:cat', [upload.single('photo'), tokenVerify], (req, res) => {
    const Id = req.params.cat
    if (!mongoose.Types.ObjectId.isValid(Id))
        return res.error('Geçersiz Id')

    const { name, price, calori, preparationTime, commentary } = req.body
    if (!name || !price || price < 0 || calori < 0 || !preparationTime || preparationTime < 0)
        return res.error('Bazı alanlar geçersiz.')

    const photo = req.file?.filename || 'ornekProduct'

    Organization.findOneAndUpdate({ _id: req.AuthData, 'menu._id': Id }, { $push: { 'menu.$.products': { name, price, calori, preparationTime, commentary, photo } } }, { new: true, runValidators: true }).select('-_id menu')
        .then(data => {
            if (!data)
                return res.error('Kategori bulunamadı')
            res.json({ ok: true })
        })
        .catch(err => {
            res.error('', err)
        })
})

router.put('/:cat/:id', tokenVerify, (req, res) => {
    const cat = req.params.cat
    if (!mongoose.Types.ObjectId.isValid(cat))
        return res.error('Geçersiz Kategori Id`si')

    const Id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(Id))
        return res.error('Geçersiz Id')

    const { name, price, calori, preparationTime, commentary } = req.body
    if (!name || !price || price < 0 || calori < 0 || !preparationTime || preparationTime < 0)
        return res.error('Bazı alanlar geçersiz.')

    Organization.findOne({ _id: req.AuthData, 'menu._id': cat, 'menu.products._id': Id }, 'menu')
        .then(data => {
            if (!data)
                return res.error('Bulunamadı')
            data.menu.id(cat).products.id(Id).name = name
            data.menu.id(cat).products.id(Id).price = price
            data.menu.id(cat).products.id(Id).calori = calori
            data.menu.id(cat).products.id(Id).preparationTime = preparationTime
            data.menu.id(cat).products.id(Id).commentary = commentary

            data.save()
                .then(data => {
                    if (!data)
                        return res.error('', { message: 'Ürün düzenlerken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })
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

router.put('/:cat/photo/:id', [upload.single('photo'), tokenVerify], (req, res) => {
    const cat = req.params.cat
    if (!mongoose.Types.ObjectId.isValid(cat))
        return res.error('Geçersiz Kategori Id`si')

    const Id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(Id))
        return res.error('Geçersiz Id')

    const photo = req.file?.filename
    if (!photo)
        return res.error('Fotoğraf eksik ya da geçerli değil')

    Organization.findOne({ _id: req.AuthData, 'menu._id': cat, 'menu.products._id': Id }, 'menu')
        .then(data => {
            if (!data)
                return res.error('Bulunamadı')
            var eskiPhoto = data.menu.id(cat).products.id(Id).photo
            data.menu.id(cat).products.id(Id).photo = photo

            data.save()
                .then(data => {
                    if (!data)
                        return res.error('', { message: 'Ürün düzenlerken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })
                    res.json({ ok: true })

                    if (eskiPhoto != 'ornekProduct') {
                        fs.unlink(path.join(__dirname, '/../uploads/' + eskiPhoto), (err) => {
                        })
                    }
                })
                .catch(err => {
                    return res.error(err.message)
                })
        })
        .catch(err => {
            res.error('', err)
        })
})

router.delete('/:cat/:id', tokenVerify, (req, res) => {
    const cat = req.params.cat
    if (!mongoose.Types.ObjectId.isValid(cat))
        return res.error('Geçersiz Kategori Id`si')

    const Id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(Id))
        return res.error('Geçersiz Id')

    Organization.findOneAndUpdate({ _id: req.AuthData, 'menu._id': cat }, { $pull: { 'menu.$.products': { _id: Id } } }, { runValidators: true }).select('-_id menu')
        .then(data => {
            if (!data)
                return res.error('Bulunamadı')
            const category = data.menu.find(x => x._id == cat)
            const product = category.products.findIndex(x => x._id == Id)

            if (product == -1)
                return res.error('Kategori ve ürün eşleşmiyor.')

            res.json({ ok: true })
        })
        .catch(err => {
            res.error('', err)
        })
})

module.exports = router