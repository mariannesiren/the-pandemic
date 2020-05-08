const mongoose = require('mongoose');

const countryInfoSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  country: String,
  confirmed: Number,
  deaths: Number,
  recovered: Number,
  active: Number,
  date: Date,
});

module.exports = mongoose.model('Country-info', countryInfoSchema);