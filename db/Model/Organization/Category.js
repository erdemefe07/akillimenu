const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ProductSchema = require('./Product')

const CategorySchema = new Schema({
  name: {
    type: String,
    maxlength: [30, '{PATH} en fazla 30 karakter olmalı'],
    required: [true, '{PATH} girilmesi zorunludur']
  },
  photo: {
    type: String,
    default: 'ornekCategory'
  },
  products: [ProductSchema]
})

module.exports = CategorySchema
