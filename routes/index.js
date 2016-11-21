var express = require('express');
var router = express.Router();

/* PostgreSQL and PostGIS module and connection setup */
var pg = require("pg"); // require Postgres module

var conString = "postgres://aivh:aivh@localhost:5432/pg_map"; // Database Connection

// Set up your database query to display GeoJSON
var puntos_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM(SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((gid, nommunicip)) As properties FROM capital As lg) As f) As fc";


/*var conString = "postgres://adminsig72:Colombia2014@192.168.11.66:5432/servicios_web"; // Database Connection*/

/*var puntos_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((gid, nommunicip)) As properties FROM ciudades As lg) As f) As fc";*/

/* GET Postgres JSON data */
router.get('/data', function (req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var query = client.query(puntos_query);
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.send(result.rows[0].row_to_json);
        res.end();
    });
});

/* GET the map page */
router.get('/map', function(req, res) {
    var client = new pg.Client(conString); // Setup our Postgres Client
    client.connect(); // connect to the client
    var query = client.query(puntos_query); // Run our Query
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    // Pass the result to the map page
    query.on("end", function (result) {
        var data = result.rows[0].row_to_json // Save the JSON as variable data
        res.render('map', {
            title: "Express API I2D", // Give a title to our page
            jsonData: data // Pass data to the View
        });
    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
