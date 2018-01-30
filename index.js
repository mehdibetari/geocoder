const fs               = require('fs');
const async            = require('async');
const colors           = require('colors');
const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyD2WVlFMdJjsR4pH2-V_qXEQunOLn5l59g'
  });
  
let geocoding = [];
fs.readFile('./address-prodevis.json', 'utf8', (err,data) => {
    const address = JSON.parse(data);
    async.mapSeries(address, function(item, done) {
        console.log(address.indexOf(item),'/',address.length);
        const geocode = alreadyGeocoded(item);
        if (geocode) {
            console.log(colors.bgWhite.magenta('Already Geocoded ',item.adr1, ' | ', item.CP, ' | ', item.ville));
            item.geometry = geocode;
            geocoding.push(item);
            done();
        }
        else {
            setTimeout(()=> {
                // Geocode an address.
                googleMapsClient.geocode({
                    address: item.adr1 + ', ' + item.CP +  ', ' + item.ville + ', FR'
                }, function(err, response) {
                    if (!err) {
                        console.log(colors.bgGreen.white('GMAP call ',item.adr1, ' | ', item.CP, ' | ', item.ville , ' : SUCCESS'));
                        item.geometry = response.json.results[0].geometry;
                    }
                    else {
                        console.log(colors.bgMagenta.white('GMAP call ',item.adr1, ' | ', item.CP, ' | ', item.ville , ' : FAIL'));
                    }
                    geocoding.push(item);
                    done();
                });
    
            },250);
        }
    }, function() {
        fs.writeFile('./results.json', JSON.stringify(geocoding), function(){
            console.log(colors.bgWhite.green('File successfully written! - Check your project directory for the ./results.json file'));
        });
    });

    function alreadyGeocoded (item) {
        const match = address.filter((data) => {
            return data.geometry && data.CP === item.CP && data.ville.toLowerCase() === item.ville.toLowerCase() && data.adr1.toLowerCase() === item.adr1.toLowerCase();
        });
        return match[0] || false;
    }
});
