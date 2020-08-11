const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Organization = require('../db/Model/Organization.js')
const tokenVerify = require('../helpers/jwt').verify
const upload = require('../helpers/multer')

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

router.get('/:cat/:id', tokenVerify, (req, res) => {
    const cat = req.params.cat
    const Id = req.params.id

    if (!mongoose.Types.ObjectId.isValid(cat))
        return res.error('Geçersiz Kategori Id`si')

    if (!mongoose.Types.ObjectId.isValid(Id))
        return res.error('Geçersiz Ürün Id`si')

    Organization.findById(req.AuthData, '-_id menu')
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

    Organization.findOne({ _id: req.AuthData, 'menu._id': Id }).select('menu')
        .then(async data => {
            if (!data)
                return res.error('Kategori bulunamadı')

            let _Photo
            if (!req.file)
                data.menu.id(Id).products.push({ name, price, calori, preparationTime, commentary })
            else {
                await res.ResimYukle(req.file)
                    .then(result => {
                        data.menu.id(Id).products.push({ name, price, calori, preparationTime, commentary, photo: result.data })
                        _Photo = result.data
                    })
                    .catch(err => {
                        return res.json(err)
                    })
            }

            data.save()
                .then(data => {
                    if (!data)
                        return res.error('', { message: 'Ürün eklerken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })
                    const _data = data.menu.id(Id).products
                    const productId = _data[_data.length - 1]._id
                    res.json({ ok: true, _id: data._id, categoryId: Id, productId, photo: _Photo })
                })
                .catch(err => {
                    return res.error(err.message)
                })
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

    Organization.findOne({ _id: req.AuthData, 'menu._id': cat, 'menu.products._id': Id }, 'menu')
        .then(async data => {
            if (!data)
                return res.error('Bulunamadı')

            const ProductPhoto = data.menu.id(cat).products.id(Id).photo
            if (ProductPhoto == 'ornekProduct') {
                await res.ResimYukle(req.file)
                    .then(result => {
                        _Photo = result.data
                        data.menu.id(cat).products.id(Id).photo = result.data
                    })
                    .catch(err => {
                        return res.json(err)
                    })
            }
            else {
                await res.ResimDegistir(ProductPhoto, req.file)
                    .then(result => {
                        _Photo = result.data
                        data.menu.id(cat).products.id(Id).photo = result.data
                    })
                    .catch(err => {
                        return res.json(err)
                    })
            }

            data.save()
                .then(data => {
                    if (!data)
                        return res.error('', { message: 'Ürün düzenlerken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })
                    res.json({ ok: true, photo: _Photo })
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
            const product = category.products.find(x => x._id == Id)

            if (!product)
                return res.error('Kategori ve ürün eşleşmiyor.')
            res.json({ ok: true })

            res.ResimSil(product.photo)
        })
        .catch(err => {
            res.error('', err)
        })
})

module.exports = router