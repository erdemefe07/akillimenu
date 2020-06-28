const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator');

const IsletmeSchema = new Schema({
  KullaniciAdi: {
    type: String,
    required: [true, "'Kullanıcı Adı' alanı zorunludur"]
  },
  Sifre: {
    type: String,
    required: [true, "'Şifre' alanı zorunludur"],
  },
  Email: {
    type: String,
    required: [true, "'Email' alanı zorunludur"],
    validate: [isEmail, 'Geçersiz Email']
  },
  IsletmeAdi: {
    type: String,
    required: [true, "'İşletme Adı' alanı zorunludur"],
  },
  Adres: {
    type: String,
    required: [true, "'Adres' alanı zorunludur"],
  },
  KayitTarihi: {
    type: Date,
    default: Date.now
  },

  Menu: {
    Çorbalar: [{
      Ad: String,
      Fiyat: Number,
      Kalori: Number,
      Hazirlanma_Suresi: Number,
      Aciklama: String
    }],
    AnaYemekler: [{
      Ad: String,
      Fiyat: Number,
      Kalori: Number,
      Hazirlanma_Suresi: Number,
      Aciklama: String
    }],
    Meşrubatlar: [{
      Ad: String,
      Fiyat: Number,
      Kalori: Number, // not required
      Hazirlanma_Suresi: Number,
      Aciklama: String
    }],
    Tatlilar: [{
      Ad: String,
      Fiyat: Number,
      Kalori: Number,
      Hazirlanma_Suresi: Number,
      Aciklama: String
    }],
  }
});

module.exports = mongoose.model('Isletme', IsletmeSchema);
mongoose.Promise = global.Promise;