// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//TODO: extract to a form?
const $ = require('jquery');
const settings = require('electron-settings');
const ZoomdataUploadSender = require('./ZoomdataUploadSender.js');
const MySQLSender = require('./MysqlSender');
const NdbcData = require('./NbdcData.js');
const ActiveStations = require('./ActiveStations.js');
const dateUtils = require('./dateUtils.js');

let statusMessages = []; //array for messages to display in the status area.  New messages are added to the beginning so they appear at the top of the textarea, and the list is truncated to keep it from getting too big

//For the upload service we need Zoomdata connection info.  
//Get the accountId and sourceId  from the API endpoint when you define the upload source.
//To store data in memsql or mysql define a mysql connection block.
//To prevent storing of passwords in the code (which is up on github) create the settings file in
// /Users/<username>/Library/Application\ Support/ndbc_data/Settings
//
// The file contains an array of connection definitions.  So, you could have the data go to both upload
// and mysql (in theory, have not really tested this)
//For example:
/*
{"connections":[
    {
        "type":"mysql",
        "host":"hostname",
        "port":"3306",
        "user":"username",
        "database":"databasename"
    },{
        "type":"upload",
        "url":"https://zoomdata.server:8080",
        "path":"/zoomdata",
        "user":"username",
        "password":"password",
        "accountId":"aaaaaacountidbbff1122"
    }
]}
*/
// The actual source name or database table is defined in the data subclass (NdbcData or ActiveStations)

console.log('Loading/saving settings to file ', settings.file(),settings.get("connections"));

//TODO: handle multiple connections in the array.  Eventually I want to put a drop-down on the
//UI that will let the user pick which destination to which they want the data sent
if(settings.get("connections").length != 1 ) {
    console.error("Currently only supports 1 connection type in the settings file, sorry");
}

let sender;
switch(settings.get("connections")[0].type) {
    case "mysql":
        console.log("Setting up mysql data connection", settings.get("connections")[0]);
        sender = new MySQLSender(settings.get("connections")[0], onSentMessage);
        break;
    case "upload":
        console.log("Setting up mysql data connection");
        break;
    default:
        console.log('Valid values for type are one of "mysql" or "upload".  You didn\'t use one of those, so sorry, gonna crash');
        break;        
}

let ndbcData = new NdbcData([sender]);
let activeStations = new ActiveStations([sender]);


function onSentMessage(resp) {
    console.log('onSentMessage', resp);
    displayStatusMessage(resp);
}
function displayStatusMessage(resp) {
 const now = new Date();
 let style = {color:'green'};
 if(resp.type === 'error') {
    style = {color:'red'}
    console.error(resp);
 }
 var formattedMsg = dateUtils.pad(now.getUTCHours()) + ":" + dateUtils.pad(now.getUTCMinutes()) + ":" + dateUtils.pad(now.getUTCSeconds()) +
     '\t' + resp.msg;
 statusMessages.unshift(formattedMsg);
 if(statusMessages.length > 64) { statusMessages.pop()}
 let messageString = statusMessages.join('<br/>');
 $('#status').html(messageString);
}


$('#updateActiveBuoyData').click((evt) => {
    activeStations.update();
});

$('#startCollecting').click((evt) => {
    console.log($('#startCollecting').html() );
    if($('#startCollecting').html() === 'Start Collecting Obs') {
        $('#startCollecting').html('Stop Collecting');
        ndbcData.start();
    } else {
        $('#startCollecting').html('Start Collecting Obs');
        ndbcData.stop();
    }
});
