const express = require("express");
const cors = require('cors');
const app = express();

app.use(cors())

if (!process.env.npm_config_production) {
  require("dotenv").config()
}
require("./db/connection.js")();

const indexRouter = require("./routes/index.js")
const isletmeRouter = require("./routes/isletme.js")

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('views'));

app.use('/isletme', isletmeRouter);
app.use('/', indexRouter);

app.listen(process.env.PORT || 3000);

module.exports = app;