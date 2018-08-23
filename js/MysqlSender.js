
/*
Post the data to a table in MySQL.  Assumes the table already exists and the fields are named to match what the data generator passes for object keys
*/
const mysql = require('mysql');
let os = require("os");
let MysqlSender = function(connectionOptions, onMessageSent)  {
  this.onMessageSent = onMessageSent;
  this.connectionOptions = connectionOptions;
  this.connectionOptions.localAddress = os.networkInterfaces().en0[0].address;
  this.connectionOptions.debug = true;
  console.log(os.networkInterfaces());
  console.log("Creating connection:", this.connectionOptions);
  this.connection = mysql.createConnection(this.connectionOptions);

  /*
  Insert a collection of data into MySQL
  data is an array of objects.  NOTE: assumes that all fields are present and the same in all objects.  Null fields in the data must be explcitly set to null, not just left off/undefined
  options:
    tableName: required, name of target table
    allowDuplicates: optional, default true.  If false then "ON DUPILCATE KEY UPDATE" is appended to the query.  This assumes the key is unique (like the station ID)

  */
  this.sendData = function(data, options) {
    let self = this;
    //TODO: variable check - make sure data has more than 0 elements, options contains tablename
    //take the first object in the keys and build a list of field names
    let fieldNameArray = Object.keys(data[0]);
    let fieldsList = fieldNameArray.join(',');

    let allowDuplicates = true;
    if(typeof(options.allowDuplicates) !== 'undefined' ) {
      allowDuplicates = options.allowDuplicates;
    }

    let action = 'INSERT';
    if(allowDuplicates === false) {
      action = 'REPLACE'//mysql specific extension
    }

    //for each object make an array of values, push into bulk insert array
    let values = [];
    data.forEach((element) => {
      values.push(Object.values(element));
    });
    //create and run the query
    let queryString = `${action} INTO ${this.connectionOptions.database}.${options.tableName} (${fieldsList}) values ?`;
    console.log('sending query ', queryString);
    this.connection.query(queryString, [values], (err,result) => {
      if(err) {
        self.onMessageSent({type:'error', msg: 'Error from request', details: err});
      } else {
        self.onMessageSent({type:'success', msg: `Rows affected in table: ${result.affectedRows}`, details: result});
      }
    })
  }
}

module.exports = MysqlSender;