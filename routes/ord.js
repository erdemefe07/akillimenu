const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Organization = require('../db/Model/Organization.js')

router.get('/', async (req, res) => {
    const response = []

    const { org, cat } = req.body
    if (!org || !cat)
        return res.error('Bazı alanlar boş')
    if (!mongoose.Types.ObjectId.isValid(org))
        return res.error('Geçersiz İşletme Id`si')

    const _ = await Organization.findById(org, 'menu')
    if (!_)
        return res.error('İşletme Bulunamadı')

    if (!Array.isArray(cat) || cat.length < 1) {
        return res.error('Kategori beklenen şekilde değil')
    }
    let error = false
    cat.forEach(x => {
        if (!mongoose.Types.ObjectId.isValid(x.id))
            return error = 'Geçersiz Kategori Id`si'

        const kategori = _.menu.find(a => a.id == x.id)
        if (!kategori)
            return error = 'Kategori Bulunamadı'

        if (!x.products || !Array.isArray(x.products) || x.products.length < 1)
            return error = 'Ürünler beklenen şekilde değil'

        let prod = []
        x.products.forEach(y => {
            if (!mongoose.Types.ObjectId.isValid(y.id))
                return error = 'Geçersiz Ürün Id`si'

            if (typeof y.count != 'number' || y.count < 1)
                return error = 'Geçersiz Ürün Miktarı'

            if (typeof y.comment != 'string')
                return error = 'Geçersiz Ürün Yorumu'

            const product = kategori.products.find(x => x.id == y.id)

            if (!product)
                return error = 'Ürün bulunamadı'

            prod.push({ ürün: product.name, miktar: y.count, açıklama: y.comment })
        })
        response.push({
            kategori: kategori.name,
            ürünler: prod
        })
    })

    if (error)
        return res.error(error)

    req.app.io.to(org).emit('data', JSON.stringify(response, null, 2))

    return res.json(response)
})

module.exports = router
