/* eslint-disable curly */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const uniqueValidator = require('mongoose-unique-validator')
const PasswordValidator = require('password-validator')
const pass = new PasswordValidator()
const { isEmail, isMobilePhone } = require('validator')
const CategorySchema = require('./Category')
const TableSchema = require('./Table')
pass
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().not().spaces()

const OrganizationSchema = new Schema({
  name: {
    type: String,
    maxlength: [30, '{PATH} en fazla 30 karakter olmalı'],
    required: [true, '{PATH} girilmesi zorunludur'],
    unique: true
  },
  email: {
    type: String,
    required: [true, '{PATH} girilmesi zorunludur'],
    validate: [isEmail, 'Geçersiz email'],
    unique: true
  },
  username: {
    type: String,
    minlength: [5, '{PATH} en az 5 karakter olmalı'],
    maxlength: [35, '{PATH} en fazla 35 karakter olmalı'],
    required: [true, '{PATH} girilmesi zorunludur'],
    unique: true
  },
  password: {
    type: String,
    minlength: [8, '{PATH} en az 8 karakter olmalı'],
    maxlength: [50, '{PATH} en fazla 50 karakter olmalı'],
    required: [true, '{PATH} girilmesi zorunludur'],
    select: false
  },
  address: {
    type: String,
    minlength: [8, '{PATH} en az 8 karakter olmalı'],
    maxlength: [300, '{PATH} en fazla 300 karakter olmalı'],
    required: [true, '{PATH} girilmesi zorunludur'],
  },
  phone: {
    type: String,
    required: [true, '{PATH} girilmesi zorunludur'],
    validate: [isMobilePhone, 'Geçersiz email'],
  },
  photo: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  tables: [TableSchema],
  menu: [CategorySchema]
})

OrganizationSchema.pre('save', function (next) {
  if (!this.isModified('password')) { return next() }

  if (pass.validate(this.password))
    next()
  else
    throw new Error('Şifre alanı boşluk içermemeli, en az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir')

  this.password = bcrypt.hashSync(this.password, 10)
  next()
})

OrganizationSchema.plugin(uniqueValidator, { message: '{PATH} daha önceden kayıt olmuş.' })
module.exports = mongoose.model('Organization', OrganizationSchema)
mongoose.Promise = global.Promise
