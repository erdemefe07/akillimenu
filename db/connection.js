const mongoose = require('mongoose');

module.exports = () => {
  try {
    mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    mongoose.connection.on('open', () => {
      console.log("bağlandı\n")
    });

    mongoose.connection.on('error', (err) => {
      console.log("MONGODB FAILED...\n", err);
    })
  } catch (err) {
    console.log("THERE IS BIGGEST ERROR", err)
  }
}