const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile("isletme.html", { root: __dirname + "/../views/" })
});

module.exports = router;