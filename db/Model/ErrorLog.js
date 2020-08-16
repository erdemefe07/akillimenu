/* eslint-disable curly */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ErrorLogSchema = new Schema({
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

module.exports = mongoose.model('ErrorLog', ErrorLogSchema)
mongoose.Promise = global.Promise