const multer = require('multer')
module.exports = multer({
  limits: { fileSize: 2097152 },
  fileFilter: function (req, file, callback) {
    const mime = file.mimetype
    if (mime == 'image/png' || mime == 'image/jpeg')
      return callback(null, true)
    else {
      return callback('Sadece resim dosyaları kabul edilir', false)
    }
  },
})