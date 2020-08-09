const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Organization = require('../db/Model/Organization.js')
const tokenVerify = require('../helpers/jwt').verify
const signToken = require('../helpers/jwt').sign
const bcrypt = require('bcrypt')
const { isEmail } = require('validator')
const Tokens = require('../db/redis.js')
const path = require('path')
const multer = require('multer')
const upload = multer({
  limits: { fileSize: 2097152 }, fileFilter: function (req, file, callback) {
    const mime = file.mimetype
    if (mime != 'image/png' || mime != 'image/jpeg')
      return callback('Sadece resim dosyaları kabul edilir')
    callback(null, true)
  },
})

router.get('/', (req, res) => {
  Organization.find()
    .then(data => res.json(data))
    .catch(err => res.error('', err))
})

router.get('/current', tokenVerify, (req, res) => {
  Organization.findById(req.AuthData)
    .then(data => res.json(data))
    .catch(err => res.error('', err))
})

router.get('/:id', (req, res) => {
  const Id = req.params.id
  if (!mongoose.Types.ObjectId.isValid(Id))
    return res.error('Geçersiz Id')

  Organization.findById(Id)
    .then(data => {
      if (!data)
        return res.error('İşletme bulunamadı')
      res.json(data)
    })
    .catch(err => res.error('', err))
})

// ! ------ POST------ POST ------ POST ------ POST ------ POST ------ POST------

router.post('/', (req, res) => {
  const { username, password, email, name, address, phone } = req.body
  if (!username || !password || !email || !name || !address || !phone)
    return res.error('Bazı alanlar boş')

  const organization = new Organization({ username, password, email, name, address, phone })

  organization.save()
    .then(data => {
      if (!data)
        return res.error('', data)

      signToken(String(data._id))
        .then(datas => {
          if (!datas)
            return res.error('', datas)

          Tokens.set(String(data._id), datas)

          return res.json({ ok: true })
        })
    })
    .catch(err => res.error(err.message))
})

router.put('/', [upload.single('photo'), tokenVerify], (req, res) => {
  Organization.findById(req.AuthData).select('photo')
    .then(async data => {
      if (!data)
        return res.error('', { message: 'İşletme fotoğrafı değiştirirken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })

      let _Photo
      if (data.photo == 'ornekOrganization') {
        await res.ResimYukle(req.file)
          .then(result => {
            data.photo = result.data
            _Photo = result.data
          })
          .catch(err => {
            return res.json(err)
          })
      }
      else {
        await res.ResimDegistir(data.photo, req.file)
          .then(result => {
            data.photo = result.data
            _Photo = result.data
          })
          .catch(err => {
            return res.json(err)
          })
      }

      data.save()
        .then(data => {
          if (!data)
            return res.error('', { message: 'Resim yüklerken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })
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

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.error('Bazı alanlar boş')

  let organization
  if (isEmail(username)) {
    organization = await Organization.findOne({ email: username }, 'password')
  } else {
    organization = await Organization.findOne({ username }, 'password')
  }

  if (!organization) return res.error('İşletme bulunamadı')

  if (!await bcrypt.compare(password, organization.password)) {
    return res.error('Şifre yanlış')
  }

  Tokens.get(String(organization._id))
    .then(data => {
      if (data)
        return res.json({ ok: true, token: data })
      return res.error('', err)
    })
    .catch(err => res.error('', err))
})

router.post('/logout', tokenVerify, async (req, res) => {
  // const sonuc = await Tokens.del(req.AuthData)
  if (sonuc) {
    res.json({ ok: true })
  } else {
    res.error('', sonuc)
  }
})

router.post('/resetPassword', tokenVerify, async (req, res) => {
  const { password, oldPassword } = req.body
  if (!password || !oldPassword)
    return res.error('Bazı alanlar boş')
  if (password == oldPassword)
    return res.error('Yeni şifre ve eski şifre aynı olamaz')

  const organization = await Organization.findById(req.AuthData, 'password')

  if (!await bcrypt.compare(oldPassword, organization.password)) {
    return res.error('Şifre yanlış')
  }

  organization.password = password

  organization.save()
    .then(data => {
      signToken(req.AuthData)
        .then(data => {
          if (data) {
            Tokens.set(String(req.AuthData), data)
            return res.json({ ok: true, token: data })
          }
          return res.error('', err)
        })
        .catch(err => res.error('', err))
    })
    .catch(err => {
      return res.error(err.message)
    })
})


module.exports = router
