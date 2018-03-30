const stringifyObject = require('stringify-object');
const request = require('request');
const dateUtils = require('./dateUtils.js');
const querystring = require('querystring');

let nbdcData = function(sender) {
  this.sender = sender;
  this.timeStep = 300000; //NDBC realtime data is updated every 5 minutes
  this.pullTimer = null; //timer object that triggers the pull of data


  this.start = function() {
    console.log('starting data collection');
    this.getNBDCData();
    this.pullTimer = setInterval(this.getNBDCData.bind(this), this.timeStep);
  };

  this.stop = function() {
    clearTimeout(this.pullTimer);
  }
  
  this.obsLineToJSON = function(line) {
    let vals = line.split(/\s+/);
    let newItem = {};
    newItemFields = [
      {name: 'station_id', type: 'string'},
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
      } else {
        newVal = null;
      }
      fieldName = newItemFields[currIndex].name;
      newItem[fieldName] = newVal;
    });
    let obsDate = `${newItem.year}-${dateUtils.pad(newItem.month)}-${dateUtils.pad(newItem.day)} ${dateUtils.pad(newItem.hour)}:${dateUtils.pad(newItem.minute)}:00`;
    newItem.obs_time = obsDate;
    return newItem;
  }

  this.parseAndSendLatestObs = function(body) {
    let self = this;
    //split out each line, ignore the first two header lines
    let lines = body.split('\n');
    lines.shift();
    lines.shift();
    //strip out any trailing blank lines
    while(lines[lines.length-1].length <=1) {
      lines.pop();
    }
    let jsonLines = [];
    
    lines.forEach(function(currLine) {
      let newItem = self.obsLineToJSON(currLine);
      //jsonLines.push(stringifyObject(newItem));
      jsonLines.push(newItem);
    });
    console.log('final data to send: ', jsonLines);
    this.sender.sendData(jsonLines);
  }

  this.getNBDCData = function() {
    let self = this;
    console.log('requesting data');
    request('http://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt', function(err, res, body) {
      if(err) {
        console.error('Error:', err);
      } else if(res.statusCode != 200) {
        console.error('Failed to get data, status ', res.statusCode);
      } else {
        self.parseAndSendLatestObs(body);
      }
    });
  }

  

}

module.exports = nbdcData;