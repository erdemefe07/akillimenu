const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
const Organization = require('../db/Model/Organization.js')

const tokenVerify = require('../helpers/jwt').verify
const upload = require('../helpers/multer')

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

router.post('/', [upload.single('photo'), tokenVerify], (req, res) => {
  const name = req.body.name
  if (!name)
    return res.error('İsim alanı boş olamaz')

  Organization.findById(req.AuthData).select('menu')
    .then(async data => {
      if (!data)
        return res.error('', { message: 'Kategori eklerken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })

      let _Photo
      if (!req.file)
        data.menu.push({ name })
      else {
        await res.ResimYukle(req.file)
          .then(result => {
            data.menu.push({ name, photo: result.data })
            _Photo = result.data
          })
          .catch(err => {
            return res.json(err)
          })
      }

      data.save()
        .then(data => {
          if (!data)
            return res.error('', { message: 'Kategori eklerken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })
          const _data = data.menu
          const categoryId = _data[_data.length - 1]._id
          res.json({ ok: true, _id: data._id, categoryId, photo: _Photo })
        })
        .catch(err => {
          return res.error(err.message)
        })
    })
    .catch(err => {
      res.error('', err)
    })
})

router.put('/:id', [upload.single('photo'), tokenVerify], (req, res) => {
  const Id = req.params.id
  if (!mongoose.Types.ObjectId.isValid(Id))
    return res.error('Geçersiz Id')

  const name = req.body.name
  if (!name)
    return res.error('İsim alanı boş olamaz')

  Organization.findOne({ _id: req.AuthData, 'menu._id': Id })
    .then(async data => {
      if (!data)
        return res.error('Kategori bulunamadı')

      data.menu.id(Id).name = name

      let _Photo = 'ornekCategory'
      if (req.file) {
        if (data.menu.id(Id).photo == 'ornekCategory') {
          await res.ResimYukle(req.file)
            .then(result => {
              _Photo = result.data
              data.menu.id(Id).photo = result.data
            })
            .catch(err => {
              return res.json(err)
            })
        }
        else {
          await res.ResimDegistir(data.menu.id(Id).photo, req.file)
            .then(result => {
              _Photo = result.data
              data.menu.id(Id).photo = result.data
            })
            .catch(err => {
              return res.json(err)
            })
        }
      }

      data.save()
        .then(data => {
          if (!data)
            return res.error('', { message: 'Kategori Düzenlerken hata meydana geldi. Lütfen kaynak koduna göz atınız.', name: 'Bilinmeyen Kaynaklı Hata' })
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

router.put('/photo/:id', [upload.single('photo'), tokenVerify], (req, res) => {
  const Id = req.params.id
  if (!mongoose.Types.ObjectId.isValid(Id))
    return res.error('Geçersiz Id')

  Organization.findOne({ _id: req.AuthData, 'menu._id': Id }).select('menu')
    .then(async data => {
      if (!data)
        return res.error('Kategori bulunamadı')

      let _Photo
      if (data.menu.id(Id).photo == 'ornekCategory') {
        await res.ResimYukle(req.file)
          .then(result => {
            _Photo = result.data
            data.menu.id(Id).photo = result.data
          })
          .catch(err => {
            return res.json(err)
          })
      }
      else {
        await res.ResimDegistir(data.menu.id(Id).photo, req.file)
          .then(result => {
            _Photo = result.data
            data.menu.id(Id).photo = result.data
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
      return res.error('', err)
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

      let PhotosToDelete = []
      const category = data.menu.find(x => x._id == Id)
      if (!category)
        return res.error('Kategori bulunamadı')

      res.json({ ok: true })

      if (category.photo != 'ornekCategory')
        PhotosToDelete.push(category.photo)

      category.products.forEach(prod => {
        if (prod.photo != 'ornekProduct')
          PhotosToDelete.push(prod.photo)
      });

      const Length = PhotosToDelete.length
      for (let i = 0; i < Length; i++) {
        res.ResimSil(PhotosToDelete[i])
      }
    })
    .catch(err => {
      res.error('', err)
    })
})

module.exports = router