const fetch = require('node-fetch');
let CronJob = require('cron').CronJob;

// Mongoose and db model
const mongoose = require('mongoose');
const CoronaInfo = require('../models/country-info');

// CSV conversion
const csvToJSON = require("csvtojson");

/*
 * CronJob so run saveData function once a day
 */
let coronaJob = new CronJob('0 9 * * *', function () {
  saveData(function(fetchSuccessful) {
    if (fetchSuccessful) {
      console.log("Data fetch successful.");
    } else {
      console.log("Error fetching data.");
    }
  });
}, null, true, 'Europe/Helsinki');


/*
 * Fetches data from github and saves it to mongoDB.
 */

function saveData(callback) {
  let date = new Date();
  date.setDate(date.getDate() - 1);
  let dateString = ('0' + (date.getMonth()+1)).slice(-2) + '-'
  + ('0' + (date.getDate())).slice(-2) + '-'
  + date.getFullYear();
  let success = false;

  // fetch data from github
  fetch('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' + dateString + '.csv')
  .then(res => res.text())
  .then(function(data) {

    success = true;

    // Transforms csv into array [["1","2","3"], ["4","5","6"], ["7","8","9"]]
    csvToJSON({
      noheader:true,
      output: "csv"
    })
    .fromString(data)
    .then((csvArray) => { 

      // Create one entry for USA
      let unitedStatesData = {
        confirmed: 0,
        deaths: 0,
        recovered: 0,
        active: 0,
        date: new Date(),
      };

      let chinaData = {
        confirmed: 0,
        deaths: 0,
        recovered: 0,
        active: 0,
        date: new Date(),
      };

      csvArray.shift();

      // Iterate through array
      csvArray.forEach(countryArray => {

        if (countryArray[3].indexOf("US") > -1) {
          unitedStatesData.confirmed += parseInt(countryArray[7]);
          unitedStatesData.deaths += parseInt(countryArray[8]);
          unitedStatesData.recovered += parseInt(countryArray[9]);
          unitedStatesData.active += parseInt(countryArray[10]);
          unitedStatesData.date = countryArray[4];
        } else if (countryArray[3].indexOf("China") > -1) {
          chinaData.confirmed += parseInt(countryArray[7]);
          chinaData.deaths += parseInt(countryArray[8]);
          chinaData.recovered += parseInt(countryArray[9]);
          chinaData.active += parseInt(countryArray[10]);
          chinaData.date = countryArray[4];
        } else {
          const coronaInfo = new CoronaInfo({
            _id: new mongoose.Types.ObjectId(),
            country: countryArray[3].toLowerCase(),
            confirmed: parseInt(countryArray[7]),
            deaths: parseInt(countryArray[8]),
            recovered: parseInt(countryArray[9]),
            active: parseInt(countryArray[10]),
            date: countryArray[4],
          });

          // Save to database
          coronaInfo.save().catch(err => {
            console.log(err);
          });
        }
      });

      // Save US numbers to database
      let coronaInfoUSA = new CoronaInfo({
        _id: new mongoose.Types.ObjectId(),
        country: "us",
        confirmed: unitedStatesData.confirmed,
        deaths: unitedStatesData.deaths,
        recovered: unitedStatesData.recovered,
        active: unitedStatesData.active,
        date: unitedStatesData.date,
      });

      coronaInfoUSA.save().catch(err => {
        console.log(err);
      });

      // Save China numbers to database
      let coronaInfoChina = new CoronaInfo({
        _id: new mongoose.Types.ObjectId(),
        country: "china",
        confirmed: chinaData.confirmed,
        deaths: chinaData.deaths,
        recovered: chinaData.recovered,
        active: chinaData.active,
        date: chinaData.date,
      });

      coronaInfoChina.save().catch(err => {
        console.log(err);
      });

    })

    callback(success);
  });
}

function saveAllData(callback) {
  let start = new Date("2020-03-22");
  let end = new Date("2020-05-07");
  
  let success = true;

  let loop = new Date(start);
  while(loop <= end) {
    let dateString = ('0' + (loop.getMonth()+1)).slice(-2) + '-'
      + ('0' + (loop.getDate())).slice(-2) + '-'
      + loop.getFullYear();
  
    fetch('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' + dateString + '.csv')
    .then(res => res.text())
    .then(function(data) {

      // Transforms csv into array [["1","2","3"], ["4","5","6"], ["7","8","9"]]
      csvToJSON({
        noheader:true,
        output: "csv"
      })
      .fromString(data)
      .then((csvArray) => { 
  
        // Create one entry for USA
        let unitedStatesData = {
          confirmed: 0,
          deaths: 0,
          recovered: 0,
          active: 0,
          date: new Date(),
        };
  
        let chinaData = {
          confirmed: 0,
          deaths: 0,
          recovered: 0,
          active: 0,
          date: new Date(),
        };
  
        csvArray.shift();

        // Iterate through array
        csvArray.forEach(countryArray => {
  
          if (countryArray[3].indexOf("US") > -1) {
            unitedStatesData.confirmed += parseInt(countryArray[7]);
            unitedStatesData.deaths += parseInt(countryArray[8]);
            unitedStatesData.recovered += parseInt(countryArray[9]);
            unitedStatesData.active += parseInt(countryArray[10]);
            unitedStatesData.date = countryArray[4];
          } else if (countryArray[3].indexOf("China") > -1) {
            chinaData.confirmed += parseInt(countryArray[7]);
            chinaData.deaths += parseInt(countryArray[8]);
            chinaData.recovered += parseInt(countryArray[9]);
            chinaData.active += parseInt(countryArray[10]);
            chinaData.date = countryArray[4];
          } else {
            const coronaInfo = new CoronaInfo({
              _id: new mongoose.Types.ObjectId(),
              country: countryArray[3].toLowerCase(),
              confirmed: parseInt(countryArray[7]),
              deaths: parseInt(countryArray[8]),
              recovered: parseInt(countryArray[9]),
              active: parseInt(countryArray[10]),
              date: countryArray[4],
            });
  
            // Save to database
            coronaInfo.save().catch(err => {
              console.log(err);
            });
          }
          
        });
        
        // Save US numbers to database
        let coronaInfoUSA = new CoronaInfo({
          _id: new mongoose.Types.ObjectId(),
          country: "us",
          confirmed: unitedStatesData.confirmed,
          deaths: unitedStatesData.deaths,
          recovered: unitedStatesData.recovered,
          active: unitedStatesData.active,
          date: unitedStatesData.date,
        });
  
        coronaInfoUSA.save().catch(err => {
          console.log(err);
        });
  
        // Save China numbers to database
        let coronaInfoChina = new CoronaInfo({
          _id: new mongoose.Types.ObjectId(),
          country: "china",
          confirmed: chinaData.confirmed,
          deaths: chinaData.deaths,
          recovered: chinaData.recovered,
          active: chinaData.active,
          date: chinaData.date,
        });
  
        coronaInfoChina.save().catch(err => {
          console.log(err);
        });
        
      })
    });
  
    let newDate = loop.setDate(loop.getDate() + 1);
    loop = new Date(newDate);
  }
  callback(success);
}

module.exports = {
  dataFetch : coronaJob, saveData, saveAllData,
}