
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DefaultBoolean = {
    type: Boolean,
    default: false
}

const Photo = {
    type: String,
    default: "ornekSlider"
}

const SettingsSchema = new Schema({
    BildirimVer: DefaultBoolean,
    BildirimSesi: {
        type: Number,
        enum: [0, 1, 2, 3],
        default: 0
    },
    Facebook: {
        type: String,
        default: 'AkilliMenum'
    },
    Instagram: {
        type: String,
        default: 'akillimenumcom'
    },
    Siparis: {
        type: Array,
        default: [true, false, false]
    },
    LogoOlsun: {
        type: Boolean,
        default: false,
    },

    Logo: {
        type: String,
        default: "ornekLogo"
    },

    BrosurTuru: {
        type: Number,
        enum: [0, 1, 2, 3],
        default: 0
    },

    BrosurArkaPlan: {
        type: String,
        default: "ornekBrosurArkaPlan"
    },

    Slider1: Photo,
    Slider2: Photo,
    Slider3: Photo,

    LogoGosterilsin: DefaultBoolean,
    KarsilamaMesaji: DefaultBoolean,
    KaranlikTema: DefaultBoolean,
    EkranOryantasyonu: DefaultBoolean,
    MenuYapisi: DefaultBoolean,
})

module.exports = SettingsSchema
