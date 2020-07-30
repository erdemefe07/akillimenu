const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Organization = require('../db/Model/Organization.js')
const tokenVerify = require('../helpers/jwt').verify

// TODO BURAYA DÖN

router.get('/org/:id', (req, res) => {
  const Id = req.params.id
  if (!mongoose.Types.ObjectId.isValid(Id))
    return res.error('Geçersiz Id')

  Organization.findById(Id, '-_id menu')
    .then(data => {
      if (!data)
        return res.error('İşletme bulunamadı')
      res.json(data.menu)
    })
    .catch(err => res.error('', err))
})

router.get('/:id', (req, res) => {
  const Id = req.params.id
  if (!mongoose.Types.ObjectId.isValid(Id))
    return res.error('Geçersiz Id')

  Organization.findOne({ 'menu._id': Id }, '-_id menu')
    .then(data => {
      if (!data)
        return res.error('Kategori bulunamadı')
      res.json(data.menu.find(x => x._id == req.params.id))
    })
    .catch(err => {
      res.error('', err)
    })
})

// ! ------ POST------ POST ------ POST ------ POST ------ POST ------ POST------


router.post('/', tokenVerify, (req, res) => {
  const name = req.body.name
  if (!name)
    return res.error('İsim alanı boş olamaz')

  Organization.findByIdAndUpdate(req.AuthData, { $push: { menu: { name } } }, { new: true, runValidators: true }).select('-_id menu').slice('menu', -1)
    .then(data => {
      if (!data)
        return res.error('', { message: 'Kategori eklerken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })
      return res.json({ ok: true })
    })
    .catch(err => {
      res.error('', err)
    })
})

router.put('/:id', tokenVerify, (req, res) => {
  const Id = req.params.id
  if (!mongoose.Types.ObjectId.isValid(Id))
    return res.error('Geçersiz Id')

  const name = req.body.name
  if (!name)
    return res.error('İsim alanı boş olamaz')

  Organization.findOneAndUpdate({ _id: req.AuthData, 'menu._id': Id }, { $set: { 'menu.$.name': name } }, { new: true, runValidators: true })
    .then(data => {
      if (!data)
        return res.error('Kategori bulunamadı')
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

  Organization.findByIdAndUpdate(req.AuthData, { $pull: { menu: { _id: Id } } }, { runValidators: true })
    .then(data => {
      if (!data)
        return res.error('', { message: 'Kategori silerken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })

      const category = data.menu.find(x => x._id == Id)
      if (!category)
        return res.error('Kategori bulunamadı')

      res.json({ ok: true })
    })
    .catch(err => {
      res.error('', err)
    })
})

module.exports = router
