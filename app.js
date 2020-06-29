const express = require("express");
const cors = require('cors');
const app = express();
const path = require('path');

app.use(cors())

if (!process.env.npm_config_production) {
  require("dotenv").config()
}
require("./db/connection.js")();

const indexRouter = require("./routes/api.js")

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

app.listen(process.env.PORT || 3000);

module.exports = app;