const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SiparisSchema = new Schema({
    orgId: mongoose.ObjectId,
    data: Schema.Types.Mixed,
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Siparis', SiparisSchema)
mongoose.Promise = global.Promise