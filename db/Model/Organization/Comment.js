const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new Schema({
    star: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5],
    },
    comment: {
        type: String,
        maxlength: 300
    },
    date: {
        type: Date,
        default: Date.now
    },
})

module.exports = CommentSchema
