const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new Schema({
    table: Number,
    order: Schema.Types.Mixed,
    user: String,
    date: {
        type: Date,
        default: function () {
            const simdi = new Date();
            simdi.setHours(simdi.getHours() + 3);
            return simdi
        }
    },
})

module.exports = OrderSchema
