/* eslint-disable curly */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ErrorLognSchema = new Schema({
    path: String,
    method: String,
    reqData: Schema.Types.Mixed,
    message: String,
    error: Schema.Types.Mixed,
    date: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('ErrorLog', ErrorLognSchema)
mongoose.Promise = global.Promise