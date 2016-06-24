var stringifyObject = require('stringify-object');
var request = require('request');
var kafka = require('kafka-node');
var HighLevelProducer = kafka.HighLevelProducer;
var Client = kafka.Client;
//connectionString: Zookeeper connection string, default localhost:2181/
//var client = new Client('10.2.1.250:2181/kafka', 'ndbc_kafka_client');
var client = new Client('localhost:2181');
var topicLatestObs = 'ndbc_latest_obs';
var producer = new HighLevelProducer(client);
var timeStep = 300000; //NDBC realtime data is updated every 5 minutes
//var timeStep = 100000;

function obsLineToJSON(line) {
  vals = line.split(/\s+/);
  newItem = {};
  newItemFields = [
    {name: 'stn', type: 'string'},
    {name: 'lat', type: 'float'},
    {name: 'lon', type: 'float'},
    {name: 'year', type: 'int'},
    {name: 'month', type: 'int'},
    {name: 'day', type: 'int'},
    {name: 'hour', type: 'int'},
    {name: 'minute', type: 'int'},
    {name: 'wind_dir',    type: 'int'},
    {name: 'wind_speed',type: 'float'},
    {name:  'gust',type: 'float'},
    {name:  'wave_height',type: 'float'},
    {name:  'dpd',type: 'int'},
    {name: 'apd',type: 'float'},
    {name: 'mwd',type: 'int'},
    {name: 'pressure',type: 'float'},
    {name: 'ptdy',type: 'float'},
    {name: 'air_temp',type: 'float'},
    {name: 'water_temp',type: 'float'},
    {name: 'dewpoint',type: 'float'},
    {name: 'vis',type: 'float'},
    {name: 'tide',type: 'float'}
  ]
  if(vals.length != newItemFields.length) {
    throw "Error, field length not matching: incoming=", vals.length, " expected=", newItemFields.length;
  }

  vals.forEach(function(currVal, currIndex) {
    if(currVal!='MM') {
      var newVal;
      fieldName = newItemFields[currIndex].name;
      switch(newItemFields[currIndex].type) {
        case 'float':
          newVal = parseFloat(currVal);
          break;
        case 'int':
          newVal = parseInt(currVal);
          break;
        default:
          newVal = currVal;
          break;
      }
      newItem[fieldName] = newVal;
    }
  });
  obsDate = new Date(newItem.year,newItem.month,newItem.day,newItem.hour, newItem.minute);
  newItem.obs_time = obsDate;
  return newItem;
}

function parseAndSendLatestObs(body) {
  //split out each line, ignore the first two header lines
  lines = body.split('\n');
  lines.shift();
  lines.shift();
  //strip out any trailing blank lines
  while(lines[lines.length-1].length <=1) {
    lines.pop();
  }
  var jsonLines = [];
  lines.forEach(function(currLine) {
    var newItem = obsLineToJSON(currLine);
    //jsonLines.push(stringifyObject(newItem));
    jsonLines.push(JSON.stringify(newItem));
  });
  var payload = {
    topic: topicLatestObs,
    messages: jsonLines
  }
  producer.send([payload], function(err, data) {
    if(err) {
      console.error("Error from Kafka: ", err);
      process.exit();
    } else {
      console.log("Posted ", lines.length, "lines to Kafka, waiting for next round in ", (timeStep/1000/60), " minutes");
      //that was fun, let's do it again!
      setTimeout(getNDBCData, timeStep);
    }
  });
}

function getNDBCData() {
  request('http://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt', function(err, res, body) {
    if(err) {
      console.error('Error:', err);
    } else if(res.statusCode != 200) {
      console.error('Failed to get data, status ', res.statusCode);
    } else {
      parseAndSendLatestObs(body);
    }
  });
}

producer.on('ready', function () {
    getNDBCData();
});

producer.on('error', function (err) {
    console.error('error', err)
});
