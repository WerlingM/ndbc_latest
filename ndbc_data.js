request = require('request');
var kafka = require('kafka-node');
var HighLevelProducer = kafka.HighLevelProducer;
var Client = kafka.Client;
var client = new Client();
var topicLatestObs = 'ndbc_latest_obs';
var producer = new HighLevelProducer(client);
//var timeStep = 300000; //NDBC realtime data is updated every 5 minutes
var timeStep = 100000;

function obsLineToJSON(line) {
  vals = line.split(/\s+/);
  newItem = {
    stn: vals[0],
    lat: vals[1],
    lon: vals[2],
    year: vals[3],
    month: vals[4],
    day: vals[5],
    hour: vals[6],
    minute: vals[7],
    wind_dir: vals[8],
    wind_speed: vals[9],
    gust: vals[10],
    wave_height: vals[11],
    dpd: vals[12],
    apd: vals[13],
    mwd: vals[14],
    pressure: vals[15],
    ptdy: vals[16],
    air_temp: vals[17],
    water_temp: vals[18],
    dewpoint: vals[19],
    vis: vals[20],
    tide: vals[21]
  }

  vals.forEach(function(currVal, currIndex, sourceArray) {
    if(currVal=='MM') { sourceArray[currIndex] = null}
  });
  newItem.obs_time = newItem.year + '-' + newItem.month+ '-' + newItem.day+ ' ' + newItem.hour+ ':' + newItem.minute + ':00';
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
    jsonLines.push(JSON.stringify(newItem));
  });
  var payload = {
    topic: topicLatestObs,
    messages: jsonLines
  }
console.log(payload);
process.exit();
  producer.send([payload], function(err, data) {
    if(err) {
      console.error("Error from Kafka: ", err);
      process.exit();
    } else {
      console.log("Posted ", lines.length, "lines to Kafka, waiting for next round in ", (timeStep/1000));
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
