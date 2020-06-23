const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MenuSchema = new Schema({
  IsletmeId: Schema.Types.ObjectId,
  Menu: []
});

module.exports = mongoose.model('Menu', MenuSchema);
mongoose.Promise = global.Promise;