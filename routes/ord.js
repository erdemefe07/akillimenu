const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Organization = require('../db/Model/Organization/Organization.js')
const tokenVerify = require('../helpers/jwt').verify
const Orders = require('../db/RedisModel/Orders')

// Tüm siparişler
router.get('/', tokenVerify, async (req, res) => {
    const siparis = await Orders.GetOrders(req.AuthData)
    if (!siparis)
        return res.json({ null: true })
    const dondurulcek = []

    for (const [key, value] of Object.entries(siparis)) {
        dondurulcek.push(JSON.parse(value));
    }
    res.json(dondurulcek)
})

// 'id' numaralı masa
router.get('/:id', tokenVerify, async (req, res) => {
    const siparis = await Orders.GetOrderIndex(req.AuthData, req.params.id)
    if (!siparis)
        return res.json({ null: true })
    res.json(JSON.parse(siparis))
})

// Masa kapatma
router.delete('/', tokenVerify, async (req, res) => {
    const { ordersArray, del } = req.body
    const siparis = JSON.parse(await Orders.GetOrderIndex(req.AuthData, del))

    //Siparislerde sadece ürünleri alma
    const siparisler = []
    for (let i = 0; i < siparis.response.length; i++) {
        const cat = siparis.response[i].ürünler;
        for (let j = 0; j < cat.length; j++) {
            const prod = cat[j];
            siparisler.push(prod)
        }
    }

    siparis.response = []
    for (let i = 0; i < ordersArray.length; i++) {
        const urun = siparisler[ordersArray[i]]
        if (urun)
            siparis.response.push(urun)
    }

    const silinecek = await Orders.DelOrder(req.AuthData, del)
    res.json({ ok: !!silinecek })
    Organization.findByIdAndUpdate(req.AuthData, { $push: { orders: { table: siparis.masa.No, order: siparis.response, user: siparis.user } } }, { new: true })
        .then()
})

// Sipariş verme
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

    const son = { _id: new mongoose.Types.ObjectId(), date: Date.now(), masa, response, user: req.headers["user-agent"] }
    req.app.io.to(org).emit('data', JSON.stringify(son, null, 2))

    const siparis = JSON.parse(await Orders.GetOrderIndex(org, masa.No))
    if (siparis)
        siparis.response.forEach(element => {
            son.response.push(element)
        });
    Orders.SetOrder(org, String(masa.No), JSON.stringify(son, null, 2))
    return res.json({ ok: true })
})

router.post('/userEvent', (req, res) => {
    const { event, table, org } = req.body
    if (typeof event != 'boolean')
        return res.json('Olay bilgisi alınamadı.')

    if (typeof table != 'number')
        return res.json('Masa bilgisi alınamadı.')

    if (!mongoose.Types.ObjectId.isValid(org))
        return res.error('İşletme bilgisi alınamadı.')

    req.app.io.to(org).emit('event', { event, table })

    res.json({ ok: true })
})

module.exports = router