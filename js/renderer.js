// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//TODO: extract to a form?
let $ = require('jquery');
const ZoomdataUploadSender = require('./ZoomdataUploadSender.js');
const NbdcData = require('./NbdcData.js');
const dateUtils = require('./dateUtils.js');

let statusMessages = []; //array for messages to display in the status area.  New messages are added to the beginning so they appear at the top of the textarea, and the list is truncated to keep it from getting too big

//For the upload service we need Zoomdata connection info.  Get the accountId and sourceId from the API endpoint when you define the upload source
var zoomdataConnectionOptions = {
 url: 'http://10.2.7.208',
 port: '8080',
 path: '/zoomdata',
 user: 'admin',
 password: 'zoomdata',
 accountId:'5aaac818e4b0a85d7e8d174a'
 //sourceId is defined in the class that posts the source data
}

let zoomdataSender = new ZoomdataUploadSender(zoomdataConnectionOptions, onSentMessage);

let nbdcData = new NbdcData([zoomdataSender]);


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

nbdcData.start();