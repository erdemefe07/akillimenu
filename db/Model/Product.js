const mongoose = require('mongoose')
const Schema = mongoose.Schema

function isPrice (value) {
  const reg = /^\d+(\.\d\d?)?$/
  return reg.test(value)
}

const ProductSchema = new Schema({
  name: {
    type: String,
    maxlength: [50, '{PATH} en fazla 50 karakter olmalı'],
    required: [true, '{PATH} girilmesi zorunludur']
  },
  price: {
    type: Number,
    required: [true, '{PATH} girilmesi zorunludur'],
    validate: [isPrice, 'Geçersiz Fiyat']
  },
  calori: {
    type: Number
  },
  preparationTime: {
    type: Number,
    required: [true, '{PATH} girilmesi zorunludur']
  },
  photo: {
    type: String,
    default: 'ornekProduct'
  },
  commentary: {
    type: String,
    maxlength: [300, '{PATH} en fazla 300 karakter olmalı']
  }
})

module.exports = ProductSchema
