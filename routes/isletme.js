const express = require('express');
const router = express.Router();


router.get('/test', (req, res) => {
  res.json("thereis işletme/test")
});

router.get('/', (req, res) => {
  Menu.find()
    .then((data) => {
      res.status(200).json(data);
    })
});

router.post('/', (req, res) => {
  const menu = new Menu(req.body);
  menu.save()
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

module.exports = router;