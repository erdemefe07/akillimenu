const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TableSchema = new Schema({
    No: {
        type: Number,
        required: [true, '{PATH} girilmesi zorunludur']
    }
})

module.exports = TableSchema
