const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ProductSchema = require('./Product')

const CategorySchema = new Schema({
  name: {
    type: String,
    maxlength: [30, '{PATH} must have at most 30 characters'],
    required: [true, '{PATH} is required']
  },
  products: [ProductSchema]
})

module.exports = CategorySchema
