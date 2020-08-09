/* eslint-disable curly */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PhotoSchema = new Schema({
    photo: {
        type: Buffer,
    }
})

module.exports = mongoose.model('Photo', PhotoSchema)
mongoose.Promise = global.Promise
