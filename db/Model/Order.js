const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SiparisSchema = new Schema({
    orgId: mongoose.ObjectId,
    date: String,
    data: Schema.Types.Mixed
})

module.exports = mongoose.model('Siparis', SiparisSchema)
mongoose.Promise = global.Promise