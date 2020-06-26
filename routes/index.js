const express = require('express');
const router = express.Router();
const Isletme = require("../db/Model/Isletme.js");
const MenuGenelTest = require('../middlewares/MenuGenelTest.js');
const MesrubatTest = require('../middlewares/MesrubatTest.js');

router.get('/test', (req, res) => {
  res.json(req.body)
});

router.get('/', (req, res) => {
  Isletme.find().sort('KayitTarihi')
    .then((data) => {
      res.status(200).json(data);
    })
});

router.get('/:id', (req, res) => {
  Isletme.findById(req.params.id)
    .then((data) => {
      (data) ? res.status(200).json(data) : res.status(404).send("Bulunamadı");
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.post('/', (req, res) => {
  const isletme = new Isletme(req.body);
  isletme.save()
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.post('/:id/Corba', MenuGenelTest, (req, res) => {
  Isletme.findByIdAndUpdate(req.params.id, { $push: { "Menu.Çorbalar": req.body } }, { new: true })
    .then(data => res.json(data))
});

router.post('/:id/AnaYemek', MenuGenelTest, (req, res) => {
  Isletme.findByIdAndUpdate(req.params.id, { $push: { "Menu.AnaYemekler": req.body } }, { new: true })
    .then(data => res.json(data))
});

router.post('/:id/Mesrubat', MesrubatTest, (req, res) => {
  Isletme.findByIdAndUpdate(req.params.id, { $push: { "Menu.Meşrubatlar": req.body } }, { new: true })
    .then(data => res.json(data))
});

router.post('/:id/Tatli', MenuGenelTest, (req, res) => {
  Isletme.findByIdAndUpdate(req.params.id, { $push: { "Menu.Tatlilar": req.body } }, { new: true })
    .then(data => res.json(data))
});

router.put('/:id', (req, res) => {
  Isletme.findOneAndUpdate({ _id: req.params.id }, req.body, { runValidators: true, new: true })
    .then((data) => {
      if (!data)
        return res.status(404).send("Böyle bir yazı yok.");
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.delete('/:id', (req, res) => {
  Isletme.findByIdAndRemove(req.params.id)
    .then((data) => {
      if (data)
        return res.status(200).send("Başarıyla Silindi");
      return res.status(404).send("Bulunamadı");
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});


module.exports = router;