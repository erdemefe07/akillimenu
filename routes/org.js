const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { isEmail } = require('validator')

const Organization = require('../db/Model/Organization/Organization')
const Tokens = require('../db/RedisModel/Tokens')

const tokenVerify = require('../helpers/jwt').verify
const signToken = require('../helpers/jwt').sign
const upload = require('../helpers/multer')
const settingsMulter = upload.fields([
  { name: "Logo", maxCount: 1 },
  { name: "BrosurArkaPlan", maxCount: 1 },
  { name: "Slider1", maxCount: 1 },
  { name: "Slider2", maxCount: 1 },
  { name: "Slider3", maxCount: 1 },
])

router.get('/current', tokenVerify, (req, res) => {
  Organization.findById(req.AuthData)
    .then(data => res.json(data))
    .catch(err => res.error('', err))
})

// başlangıç ve bitiş süresi ekle
const isWithinInterval = require('date-fns/isWithinInterval')
const endOfDay = require('date-fns/endOfDay')
const addHours = require('date-fns/addHours')
router.get('/reports', tokenVerify, (req, res) => {
  const Baslangic = req.body.Baslangic ? new Date(req.body.Baslangic) : new Date('2020')
  const Bitis = req.body.Bitis ? endOfDay(new Date(req.body.Bitis)) : addHours(endOfDay(new Date()), 3)

  const response = []
  Organization.findOne({ _id: req.AuthData }, '-_id orders')
    .then(data => {
      if (!data)
        return res.error('Bulunamadı')
      const ordersLength = data.orders.length
      for (let i = 0; i < ordersLength; i++) {
        const siparis = data.orders[i];
        if (isWithinInterval(siparis.date, { start: Baslangic, end: Bitis }))
          response.push(siparis)
      }
      res.json(response)
    })
    .catch(err => res.error('', err))
})

router.get('/:username', (req, res) => {
  const username = req.params.username
  Organization.findOne({ username }, '-address -phone -email').then(data => {
    if (!data)
      return res.status(404).json({ 'message': "Bulunamadı!" })
    res.json({
      _id: data._id,
      photo: data.photo,
      username: data.username,
      name: data.name,
      tables: data.tables,
      menu: data.menu,
      settings: {
        Facebook: data.settings.Facebook,
        Instagram: data.settings.Instagram,
        Slider1: data.settings.Slider1,
        Slider2: data.settings.Slider2,
        Slider3: data.settings.Slider3
      }
    })
  })
})

// ! ------ POST------ POST ------ POST ------ POST ------ POST ------ POST------

router.post('/', (req, res) => {
  const { username, password, email, name, address, phone } = req.body
  if (!username || !password || !email || !name || !address || !phone)
    return res.error('Bazı alanlar boş')

  const organization = new Organization({ username, password, email, name, address, phone, 'settings': {} })

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

    .catch(err => {
      const errors = []
      Object.entries(err.errors).forEach(([key, value]) => errors.push(`${key}: ${value}`))
      res.error(errors)
    })
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

router.put('/settings', [settingsMulter, tokenVerify], (req, res) => {
  let { Logo, BrosurArkaPlan, Slider1, Slider2, Slider3 } = req.files || {}

  Organization.findById(req.AuthData).select("settings")
    .then(async data => {
      for (const [key, value] of Object.entries(req.body)) {
        if (value != 'null')
          data.settings[key] = value
      }

      if (Logo) {
        Logo = Logo[0]
        if (data.settings.Logo == 'ornekLogo')
          data.settings.Logo = await res.ResimYukle(Logo).then(img => img.data)
        else
          data.settings.Logo = await res.ResimDegistir(data.settings.Logo, Logo).then(img => img.data)
      }

      if (BrosurArkaPlan) {
        BrosurArkaPlan = BrosurArkaPlan[0]
        if (data.settings.BrosurArkaPlan == 'ornekBrosurArkaPlan')
          data.settings.BrosurArkaPlan = await res.ResimYukle(BrosurArkaPlan).then(img => img.data)
        else
          data.settings.BrosurArkaPlan = await res.ResimDegistir(data.settings.BrosurArkaPlan, BrosurArkaPlan).then(img => img.data)
      }

      if (Slider1) {
        Slider1 = Slider1[0]
        if (data.settings.Slider1 == 'ornekSlider')
          data.settings.Slider1 = await res.ResimYukle(Slider1).then(img => img.data)
        else
          data.settings.Slider1 = await res.ResimDegistir(data.settings.Slider1, Slider1).then(img => img.data)
      }


      if (Slider2) {
        Slider2 = Slider2[0]
        if (data.settings.Slider2 == 'ornekSlider')
          data.settings.Slider2 = await res.ResimYukle(Slider2).then(img => img.data)
        else
          data.settings.Slider2 = await res.ResimDegistir(data.settings.Slider2, Slider2).then(img => img.data)
      }

      if (Slider3) {
        Slider3 = Slider3[0]
        if (data.settings.Slider3 == 'ornekSlider')
          data.settings.Slider3 = await res.ResimYukle(Slider3).then(img => img.data)
        else
          data.settings.Slider3 = await res.ResimDegistir(data.settings.Slider3, Slider3).then(img => img.data)
      }

      data.save()
        .then(data => {
          res.json(data)
        })
        .catch(err => {
          res.json(err)
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
      // res.error('', { message: 'Login olurken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })
    })
    .catch(err => res.error('', err))
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

router.post('/refreshToken', tokenVerify, async (req, res) => {
  const { password } = req.body
  if (!password)
    return res.error('Şifre girilmemiş')

  console.log("req.AuthData", req.AuthData)
  const organization = await Organization.findById(req.AuthData, 'password')
  console.log("organization", organization)

  if (!await bcrypt.compare(password, organization.password)) {
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
