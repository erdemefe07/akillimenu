// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const SiparisSchema = new Schema({
//   Kategori: {
//     type: String,
//     required: [true, "'Kullanıcı Adı' alanı zorunludur"]
//   },
//   Sifre: {
//     type: String,
//     required: [true, "'Şifre' alanı zorunludur"],
//   },
//   Email: {
//     type: String,
//     required: [true, "'Email' alanı zorunludur"],
//   },
//   IsletmeAdi: {
//     type: String,
//     required: [true, "'İşletme Adı' alanı zorunludur"],
//   },
//   Adres: {
//     type: String,
//     required: [true, "'Adres' alanı zorunludur"],
//   },
//   KayitTarihi: {
//     type: Date,
//     default: Date.now
//   },
// });

// module.exports = mongoose.model('Siparis', SiparisSchema);
// mongoose.Promise = global.Promise;