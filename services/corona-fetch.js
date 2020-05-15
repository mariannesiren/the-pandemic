const fetch = require('node-fetch');
let CronJob = require('cron').CronJob;

// Mongoose and db model
const mongoose = require('mongoose');
const CoronaInfo = require('../models/country-info');

// CSV conversion
const csvToJSON = require("csvtojson");

// List of countries with special conditions
let specialCountries = ["Denmark", "France","Netherlands", "United Kingdom"];

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

  let dataDate = loop.getFullYear() + "-" + ('0' + (loop.getMonth()+1)).slice(-2) + '-'
    + ('0' + (loop.getDate())).slice(-2);
  dataDate += "T09:00:00.000Z";

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

      // Create one entry for specific countries
      let unitedStatesData = { confirmed: 0,deaths: 0,recovered: 0,active: 0,date: new Date(),};
      let chinaData = { confirmed: 0,deaths: 0,recovered: 0,active: 0,date: new Date(),};
      let spainData = { confirmed: 0,deaths: 0,recovered: 0,active: 0,date: new Date(),};
      let germanyData = { confirmed: 0,deaths: 0,recovered: 0,active: 0,date: new Date(),};
      let italyData = { confirmed: 0,deaths: 0,recovered: 0,active: 0,date: new Date(),};
      let canadaData = { confirmed: 0,deaths: 0,recovered: 0,active: 0,date: new Date(),};

      csvArray.shift();

      // Iterate through array
      csvArray.forEach(countryArray => {

        countryArray[4] = dataDate;

        if (countryArray[3].indexOf("US") > -1) {
          unitedStatesData = appendToObject(unitedStatesData, countryArray);
        } else if (countryArray[3].indexOf("China") > -1 && countryArray[2].indexOf("Hong Kong") < 0 && countryArray[2].indexOf("Macau") < 0) {
          chinaData = appendToObject(chinaData, countryArray);
        } else if (countryArray[3].indexOf("Germany") > -1) {
          germanyData = appendToObject(germanyData, countryArray);
        } else if (countryArray[3].indexOf("Italy") > -1) {
          italyData = appendToObject(italyData, countryArray);
        } else if (countryArray[3].indexOf("Spain") > -1) {
          spainData = appendToObject(spainData, countryArray);
        } else if (countryArray[3].indexOf("Canada") > -1) {
          canadaData = appendToObject(canadaData, countryArray);
        }else if ((countryArray[3].indexOf("China") > -1 && countryArray[2].indexOf("Hong Kong") > -1) || (countryArray[3].indexOf("China") > -1 && countryArray[2].indexOf("Macau") > -1)) {
          insertRecord(countryArray[2], countryArray);
        } else if (specialCountries.includes(countryArray[3])) {
          let countryName = '';
          if (countryArray[2] != '') {
            countryName = countryArray[2] + " (" + countryArray[3] + ")";
          } else {
            countryName = countryArray[3];
          }
          insertRecord(countryName, countryArray);
        } else {
          insertRecord(countryArray[3], countryArray);
        }

      });

      insertRecordFromObj("US", unitedStatesData);
      insertRecordFromObj("China", chinaData);
      insertRecordFromObj("Spain", spainData);
      insertRecordFromObj("Germany", germanyData);
      insertRecordFromObj("Italy", italyData);
    })

    callback(success);
  });
}

function saveAllData(callback) {
  let start = new Date("2020-03-22");
  let end = new Date("2020-05-14");
  
  let success = true;

  let loop = new Date(start);
  while(loop <= end) {
    let dateString = ('0' + (loop.getMonth()+1)).slice(-2) + '-'
      + ('0' + (loop.getDate())).slice(-2) + '-'
      + loop.getFullYear();

    let dataDate = loop.getFullYear() + "-" + ('0' + (loop.getMonth()+1)).slice(-2) + '-'
    + ('0' + (loop.getDate())).slice(-2);
    dataDate += "T09:00:00.000Z";
  
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

        // Create one entry for specific countries
        let unitedStatesData = { confirmed: 0,deaths: 0,recovered: 0,active: 0,date: new Date(),};
        let chinaData = { confirmed: 0,deaths: 0,recovered: 0,active: 0,date: new Date(),};
        let spainData = { confirmed: 0,deaths: 0,recovered: 0,active: 0,date: new Date(),};
        let germanyData = { confirmed: 0,deaths: 0,recovered: 0,active: 0,date: new Date(),};
        let italyData = { confirmed: 0,deaths: 0,recovered: 0,active: 0,date: new Date(),};
  
        csvArray.shift();
  
        // Iterate through array
        csvArray.forEach(countryArray => {
  
          countryArray[4] = dataDate;

          if (countryArray[3].indexOf("US") > -1) {
            unitedStatesData = appendToObject(unitedStatesData, countryArray);
          } else if (countryArray[3].indexOf("China") > -1 && countryArray[2].indexOf("Hong Kong") < 0 && countryArray[2].indexOf("Macau") < 0) {
            chinaData = appendToObject(chinaData, countryArray);
          } else if (countryArray[3].indexOf("Germany") > -1) {
            germanyData = appendToObject(germanyData, countryArray);
          } else if (countryArray[3].indexOf("Italy") > -1) {
            italyData = appendToObject(italyData, countryArray);
          } else if (countryArray[3].indexOf("Spain") > -1) {
            spainData = appendToObject(spainData, countryArray);
          } else if ((countryArray[3].indexOf("China") > -1 && countryArray[2].indexOf("Hong Kong") > -1) || (countryArray[3].indexOf("China") > -1 && countryArray[2].indexOf("Macau") > -1)) {
            insertRecord(countryArray[2], countryArray);
          } else if (specialCountries.includes(countryArray[3])) {
            let countryName = '';
            if (countryArray[2] != '') {
              countryName = countryArray[2] + " (" + countryArray[3] + ")";
            } else {
              countryName = countryArray[3];
            }
            insertRecord(countryName, countryArray);
          } else {
            insertRecord(countryArray[3], countryArray);
          }
        });
  
        insertRecordFromObj("US", unitedStatesData);
        insertRecordFromObj("China", chinaData);
        insertRecordFromObj("Spain", spainData);
        insertRecordFromObj("Germany", germanyData);
        insertRecordFromObj("Italy", italyData);
      })
    });
  
    let newDate = loop.setDate(loop.getDate() + 1);
    loop = new Date(newDate);
  }
  callback(success);
}

// Append country info to given object
function appendToObject(countryObj, countryArray) {

  countryObj.confirmed += parseInt(countryArray[7]);
  countryObj.deaths += parseInt(countryArray[8]);
  countryObj.recovered += parseInt(countryArray[9]);
  countryObj.active += parseInt(countryArray[10]);
  countryObj.date = countryArray[4];
  return countryObj;
}

// Inserts a record to database
function insertRecord(countryName, countryArray) {

  const coronaInfo = new CoronaInfo({
    _id: new mongoose.Types.ObjectId(),
    country: countryName.toLowerCase(),
    confirmed: !isNaN(countryArray[7]) ? parseInt(countryArray[7]) : "",
    deaths: !isNaN(countryArray[8]) ? parseInt(countryArray[8]) : "",
    recovered: !isNaN(countryArray[9]) ? parseInt(countryArray[9]) : "",
    active: !isNaN(countryArray[10]) ? parseInt(countryArray[10]) : "",
    date: countryArray[4],
  });

  // Save to database
  coronaInfo.save().catch(err => {
    console.log(err);
  });
}
  // Inserts a record to database from object
function insertRecordFromObj(countryName, countryObj) {

  const coronaInfo = new CoronaInfo({
    _id: new mongoose.Types.ObjectId(),
    country: countryName.toLowerCase(),
    confirmed: !isNaN(countryObj.confirmed) ? parseInt(countryObj.confirmed) : "",
    deaths: !isNaN(countryObj.deaths) ? parseInt(countryObj.deaths) : "",
    recovered: !isNaN(countryObj.recovered) ? parseInt(countryObj.recovered) : "",
    active: !isNaN(countryObj.active) ? parseInt(countryObj.active) : "",
    date: countryObj.date,
  });


  // Save to database
  coronaInfo.save().catch(err => {
    console.log(err);
  });
}

module.exports = {
  dataFetch : coronaJob, saveData, saveAllData,
}