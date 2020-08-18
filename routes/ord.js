const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Organization = require('../db/Model/Organization.js')
const tokenVerify = require('../helpers/jwt').verify
const Orders = require('../db/RedisModel/Orders')
const Order = require('../db/Model/Order')

// {
//     "org": "5f2c695be052e1001732f3af",
//     "table": "5f2c695be052e1001732f3af",
//     "cat": [
//         {
//             "id": "5f2c6a97e052e1001732f3b0",
//             "products": [
//                 {
//                     "id": "5f2c6b87e052e1001732f3b1",
//                     "count": 4,
//                     "comment": "this is my comment"
//                 }
//             ]
//         }
//     ]
// }
router.get('/', tokenVerify, async (req, res) => {
    const siparis = await Orders.GetOrder(req.AuthData)
    const dondurulcek = []

    // TODO json.parse console.log da normal gösteriyor res.jsonda object object gösteriyor
    for (const [key, value] of Object.entries(siparis)) {
        console.log("value", JSON.parse(value))
        dondurulcek.push(`${key}: ${JSON.parse(value)}`);
    }
    res.json(dondurulcek)
})

router.delete('/', tokenVerify, async (req, res) => {
    const siparis = await Orders.GetOrderIndex(req.AuthData, req.body.del)
    const silinecek = await Orders.DelOrder(req.AuthData, req.body.del)
    res.json({ ok: !!silinecek })
    new Order({ orgId: req.AuthData, data: JSON.parse(siparis) }).save()
})

router.post('/', async (req, res) => {
    const response = []

    const { org, cat, table } = req.body
    if (!org || !cat || !table)
        return res.error('Bazı alanlar boş')

    if (!mongoose.Types.ObjectId.isValid(org))
        return res.error('Geçersiz İşletme Id`si')

    if (typeof table != 'number')
        return res.error('Geçersiz Masa')

    const _ = await Organization.findById(org, 'menu tables')
    if (!_)
        return res.error('İşletme Bulunamadı')

    const masa = _.tables.find(x => x.No == table)
    if (!masa) {
        return res.error('Masa Bulunamadı')
    }

    const siparis = await Orders.GetOrderIndex(org, masa.No)
    if(siparis)
        return res.error('Sipariş tamamlanmadan yeni sipariş alınamaz')

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

            prod.push({ ürün: product.name, ürünId: product._id, fiyat: product.price, hazirlanmaSuresi: product.preparationTime, miktar: y.count, açıklama: y.comment })
        })
        response.push({
            kategoriId: kategori._id,
            kategori: kategori.name,
            ürünler: prod
        })
    })

    if (error)
        return res.error(error)

    const son = { date: Date.now(), masa, response }
    req.app.io.to(org).emit('data', JSON.stringify(son, null, 2))
    Orders.SetOrder(org, String(masa.No), JSON.stringify(son, null, 2))
    return res.json(son)
})

module.exports = router
