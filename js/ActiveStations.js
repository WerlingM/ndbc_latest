/*
 Get the active stations data from http://www.ndbc.noaa.gov/activestations.xml.  This data will be used for some of the additional 
 metadata like owner, description, type.  This creates a secondary source to enhance the main observations, either through fusion or join in the map.
 
 Uses the sender to post to a source.

 The NOAA site states that this source is updated nightly.  It is not really a trend site, so not a fit for an upload service.  

 */
const request = require('request');
const randUtils = require('./randUtils.js');

 let ActiveStations = function(senders) {
    this.tableName = 'ndbc_activestations';

    this.update = function() {
        let self = this;
        console.log('requesting data');
        request('http://www.ndbc.noaa.gov/activestations.xml', function(err, res, body) {
          if(err) {
            console.error('Error:', err);
          } else if(res.statusCode != 200) {
            console.error('Failed to get data, status ', res.statusCode);
          } else {
            let stations = self.parseXML(body);

            //I want the flags for station capabilities to be booleain instead of 'y'/'n', so run a quick conversion.
            //Plus we have to convert the lat/lon to numbers
            let data = stations.stations.station.map((element) => {
                return {
                    currents: element.currents === 'n' ? false : true,
                    dart: element.dart === 'n' ? false : true,
                    id: element.id,
                    lat: parseFloat(element.lat),
                    lon: parseFloat(element.lon),
                    met: element.met === 'n' ? false : true,
                    name: element.name,
                    owner: element.owner,
                    pgm: element.pgm,
                    type: element.type,
                    waterquality: element.waterquality === 'n' ? false : true,
                }
            })
            senders.forEach((sender) => {
               sender.sendData(data, {tableName: self.tableName, allowDuplicates:false})
            })
          }
        });
      }

      this.parseXML = function(xmlString, arrayTags) {
        var dom = null;
        if (window.DOMParser)
        {
            dom = (new DOMParser()).parseFromString(xmlString, "text/xml");
        }
        else if (window.ActiveXObject)
        {
            dom = new ActiveXObject('Microsoft.XMLDOM');
            dom.async = false;
            if (!dom.loadXML(xml))
            {
                throw dom.parseError.reason + " " + dom.parseError.srcText;
            }
        }
        else
        {
            throw "cannot parse xml string!";
        }

        function isArray(o)
        {
            return Object.prototype.toString.apply(o) === '[object Array]';
        }
        
        function parseNode(xmlNode, result)
        {
            if (xmlNode.nodeName == "#text") {
                var v = xmlNode.nodeValue;
                if (v.trim()) {
                   result['#text'] = v;
                }
                return;
            }
    
            var jsonNode = {};
            var existing = result[xmlNode.nodeName];
            if(existing)
            {
                if(!isArray(existing))
                {
                    result[xmlNode.nodeName] = [existing, jsonNode];
                }
                else
                {
                    result[xmlNode.nodeName].push(jsonNode);
                }
            }
            else
            {
                if(arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1)
                {
                    result[xmlNode.nodeName] = [jsonNode];
                }
                else
                {
                    result[xmlNode.nodeName] = jsonNode;
                }
            }
    
            if(xmlNode.attributes)
            {
                var length = xmlNode.attributes.length;
                for(var i = 0; i < length; i++)
                {
                    var attribute = xmlNode.attributes[i];
                    jsonNode[attribute.nodeName] = attribute.nodeValue;
                }
            }
    
            var length = xmlNode.childNodes.length;
            for(var i = 0; i < length; i++)
            {
                parseNode(xmlNode.childNodes[i], jsonNode);
            }
        }
    
        var result = {};
        if(dom.childNodes.length)
        {
            parseNode(dom.childNodes[0], result);
        }
    
        return result;
    }
 }

 module.exports = ActiveStations;