let express = require('express');
let router = express.Router();

// Mongoose and db model
const mongoose = require('mongoose');
const CoronaInfo = require('../models/country-info');

router.get('/', function(req, res, next) {
  res.send("Available resources: <br><br>" + 
   "/api/all <br>" + 
    "/api/country/{name}" 
  );
});

router.get('/all', function(req, res) {

  let query = createDBQuery(null, req.query);

  let projection = createDBProjection(req.query);

  CoronaInfo.find((query ? query : {}), projection,function(err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });

});

router.get('/country/:name', function(req, res) {
  
  let query = createDBQuery(req.params, req.query);

  let projection = createDBProjection(req.query);

  if (query && query.country) {
    CoronaInfo.find((query ? query : {}), projection, function(err, data) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(data);
      }
    });
  } else {
    res.sendStatus(400);
  }
});

let coronaData = require('../services/corona-fetch');
router.get('/fetchAll', function(req, res) {

  coronaData.saveAllData(function(fetchSuccessful) {
    if (fetchSuccessful) {
      console.log("Data fetch successful.");
    } else {
      console.log("Error fetching data.");
    }
  });

});

/*
 *  Creates a query for mongoose based on HTTP params and query. 
 */
function createDBQuery(params, query) {
  
  if (params && query) {
    if (params.name && query.start_date && query.end_date) {
      if (isCorrectDate(query.start_date) && isCorrectDate(query.end_date)) {
        return {
          country: params.name,
          date: {$gte: query.start_date, $lte: query.end_date}
        };
      } else {
        return null;
      } 
    } else if (params.name) {
      return {
        country: params.name
      };
    } else {
      return null;
    }
  } else if (query) {
    if (query.start_date && query.end_date) {
      if (isCorrectDate(query.start_date) && isCorrectDate(query.end_date)) {
        return {
          date: {$gte: query.start_date, $lte: query.end_date}
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
}

function createDBProjection(query) {

  // Default projection
  let projection = {_id: false, __v: false};

  if (query) {
    if (query.fields) {

      // Split fields string into an array
      let fields = query.fields.split(",");

      // Suppress the _id field and add country and date as mandatory fields
      projection = {_id: 0, date: true, country: true};

      // Add all the fields to the projection object
      fields.forEach(field => {
        projection[field] = true;
      });

      return projection
    } else {
      return projection;
    }
  } else {
    return projection;
  }
}

// Check that date string format is "yyyy-MM-dd"
function isCorrectDate(dateStr) {
  let datePattern = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}");
  return datePattern.test(dateStr);
}

module.exports = router;
