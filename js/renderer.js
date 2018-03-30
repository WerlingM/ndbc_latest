// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//TODO: extract to a form?
let $ = require('jquery');
const ZoomdataUploadSender = require('./ZoomdataUploadSender.js');
const NbdcData = require('./NbdcData.js');
const dateUtils = require('./dateUtils.js');

// For Zoombot server 2.6.5
// ':8080/zoomdata/api/upload/5aa97326e4b03972f6324d32?accountId=5aa81d6de4b08d896b644bbf' -X POST -H "Content-Type: application/json" -d '[{"customer_id":0,"device_id":"value1","drops":2,"errors":3,"load":4,"region":"value5","status":"value6","subscription_level":"value7","timestamp":"2018-03-14T19:08:27.537Z"}]' --insecure
let statusMessages = [];
var connectionOptions = {
 url: 'http://10.2.7.208',
 port: '8080',
 path: '/zoomdata',
 user: 'admin',
 password: 'zoomdata',
 accountId:'5aaac818e4b0a85d7e8d174a',
 sourceId: '5abcf2f8e4b0667f5e5cf889'
}

let sender = new ZoomdataUploadSender(connectionOptions, onSentMessage);

let nbdcData = new NbdcData(sender);


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