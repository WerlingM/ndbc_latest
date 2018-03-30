/*
 In theory we could build different senders to go to different stores.  For example, Zoomdata Upload API (this one), Kafka/Streamsets, Kudu, ...
 */
const querystring = require('querystring');

//http://10.2.7.208:8080/zoomdata/api/upload/5aba9bd4e4b0f7ad6b6bf950?accountId=5aaac818e4b0a85d7e8d174a&ignoreUnknownFields=true
//http://10.2.7.208:8080/zoomdata/api/upload/5aba9bd4e4b0f7ad6b6bf950?accountId=5aaac818e4b0a85d7e8d174a
/*
Expects connectionsOptions contianing (modified for your environment): {
 zoomdataURL: 'http://10.2.7.208',
 zoomdataPort: '8080',
 zoomdataPath: '/zoomdata',
 zoomdataUser: 'username',
 zoomdataPassword: 'password',
 accountId:'',
 sourceId: ''
}
*/
let zoomdataUploadSender = function(connectionOptions, onMessageSent) {
    this.connectionOptions = connectionOptions;
    this.onMessageSent = onMessageSent;
    this.authString = 'Basic ' + new Buffer(this.connectionOptions.user + ':' + this.connectionOptions.password).toString('base64');
    
    //POSTS the data payload to the Zoomdata Upload API endpoint defined in connectionOptions, invoke callback when done
    this.sendData = function(data) {
        let self = this;
        let urlQuery = querystring.stringify({
            accountId: this.connectionOptions.accountId,
            ignoreUnknownFields:true
        });
        let options = {
            url: this.connectionOptions.url+ ':' + this.connectionOptions.port + this.connectionOptions.path + '/api/upload/' + this.connectionOptions.sourceId + '?' + urlQuery, //for 2.5 the path is /service/upload; for 2.6 use /api/upload
            method: 'POST',
            followAllRedirects: true,
            headers: {
                'content-type': 'application/json',
                'authorization': this.authString
            }
        }
        try {
            console.log('posting to ', options);
            const net = require('electron').remote.net;
            const req = net.request(options);
            const numRows = data.length;
            req.on('response', (resp) => {
                console.log("On response from request: ", resp);
                if(resp.statusCode != '200') {
                    self.onMessageSent({type:'error', msg: 'Error from request', details: resp});
                } else {
                    self.onMessageSent({type:'success', msg: 'Sent ' + numRows + 'rows to Zoomdata', details: resp});
                }
            });
            req.on('error', (err) => {
                self.onMessageSent({type:'error', msg: 'Error from request', details: err});
            });
            req.on('finish', () => { console.log('Web request finished');});
            req.on('close', () => {console.log('Web request close event')});
            console.log('Writing message, payload  is ', JSON.stringify(data))
            req.write(JSON.stringify(data));
            req.end();
        }
        catch(e) {
            console.error('Exception in sending message', e);
//            this.onMessageSent("Exception sending request ", e);
        }
    }

}

module.exports = zoomdataUploadSender;