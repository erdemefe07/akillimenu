const express = require('express');
const router = express.Router();
const Isletme = require('../db/Model/Isletme.js');
const MenuTest = require('../middlewares/MenuTest.js');
const AdminJWT = require('../middlewares/admin-jwt.js');
const jwt = require('jsonwebtoken')

router.get('/test', (req, res) => {
  res.json("TEST ENDPOINT")
});

router.post('/test', (req, res) => {
  res.json(req.body)
});

router.get('/', (req, res) => {
  Isletme.find().sort('KayitTarihi')
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.get('/:id', (req, res) => {
  Isletme.findById(req.params.id)
    .then((data) => {
      (data) ? res.status(200).json(data) : res.status(404).json({ "Sonuç": "Bulunamadı" });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.post('/', AdminJWT, (req, res) => {
  const isletme = new Isletme(req.body);
  isletme.save()
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.post('/admin-login', (req, res) => {
  if (!(req.body.admin == 'MEDRE123'))
    return res.status(404).end();

  const payload = {
    "admin": req.body.admin
  };

  const token = jwt.sign(payload, process.env.API_SECRET_KEY, {
    expiresIn: 720 // 12 saat
  })

  res.json({
    token
  })
});

router.post('/:id/Corba', AdminJWT, MenuTest, (req, res) => {
  Isletme.findByIdAndUpdate(req.params.id, { $push: { "Menu.Çorbalar": req.body } }, { new: true })
    .then(data => res.json(data))
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.post('/:id/AnaYemek', AdminJWT, MenuTest, (req, res) => {
  Isletme.findByIdAndUpdate(req.params.id, { $push: { "Menu.AnaYemekler": req.body } }, { new: true })
    .then(data => res.json(data))
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.post('/:id/Mesrubat', AdminJWT, MenuTest, (req, res) => {
  Isletme.findByIdAndUpdate(req.params.id, { $push: { "Menu.Meşrubatlar": req.body } }, { new: true })
    .then(data => res.json(data))
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.post('/:id/Tatli', AdminJWT, MenuTest, (req, res) => {
  Isletme.findByIdAndUpdate(req.params.id, { $push: { "Menu.Tatlilar": req.body } }, { new: true })
    .then(data => res.json(data))
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.put('/:id', AdminJWT, (req, res) => {
  Isletme.findOneAndUpdate({ _id: req.params.id }, req.body, { runValidators: true, new: true })
    .then((data) => {
      if (!data)
        return res.status(404).json({ "Sonuç": "Bulunamadı" });
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.delete('/:id', AdminJWT, (req, res) => {
  Isletme.findByIdAndRemove(req.params.id)
    .then((data) => {
      if (data)
        return res.status(200).end();
      return res.status(404).send("Bulunamadı");
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});


module.exports = router;