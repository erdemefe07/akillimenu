
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DefaultBoolean = {
    type: Boolean,
    default: false
}

const SettingsSchema = new Schema({
    BildirimVer: DefaultBoolean,
    BildirimSesi: {
        type: Number,
        default: 0
    },
    Facebook: {
        type: String,
        default: 'facebook.com'
    },
    Instagram: {
        type: String,
        default: 'instagram.com'
    },
    Siparis: {
        type: Array,
        default: [true, false, false]
    },

    LogoOlsun: {
        type: Boolean,
        default: false,
    },
    // Logo: Buffer,
    BrosurTuru: {
        type: Number,
        enum: [0, 1, 2, 3],
    },
    // BrosurArkaPlan: Buffer,

    LogoGosterilsin: DefaultBoolean,
    KarsilamaMesaji: DefaultBoolean,
    KaranlikTema: DefaultBoolean,
    EkranOryantasyonu: DefaultBoolean,
    MenuYapisi: DefaultBoolean,
})

module.exports = SettingsSchema
