const express = require('express');
const port = 8080;
let coronaData = require('./services/corona-fetch');
const app = express();

// Set routers
let apiRouter = require('./routes/api');

app.use('/api', apiRouter);

app.listen(port, () => function() {
  // Start cronjob to fetch corona data
  coronaData.dataFetch.start();
});

// Import mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/PANDEMIC_DB', { useNewUrlParser: true });

let db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = {
  app,
  db
};
