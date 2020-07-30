const mongoose = require('mongoose')
const Schema = mongoose.Schema

function isPrice (value) {
  const reg = /^\d+(\.\d\d?)?$/
  return reg.test(value)
}

const ProductSchema = new Schema({
  name: {
    type: String,
    maxlength: [50, '{PATH} must have at most 50 characters'],
    required: [true, '{PATH} is required']
  },
  price: {
    type: Number,
    required: [true, '{PATH} is required'],
    validate: [isPrice, 'Invalid Price']
  },
  calori: {
    type: Number
  },
  preparationTime: {
    type: Number,
    required: [true, '{PATH} is required']
  },
  commentary: {
    type: String,
    maxlength: [300, '{PATH} must have at most 300 characters']
  }
})

module.exports = ProductSchema
