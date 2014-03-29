var pg = require('pg');
var express = require('express');
var app = express();

//var connectionString = "postgres://postgres:0792441000@localhost:5433/postgis"
var connectionString = "postgres://chris:Salisbury2Crabs@localhost:5432/vanni_test"

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req,res){
  res.sendfile('./public/index.html');
})

app.get('/findCity', function(req, res){
  console.log(req)
  var kzone = String(req.query.kzone);
  var searchCity= String(req.query.searchCity);
  var cityname = searchCity.split(',')[0]

  if (kzone != "undefined") {

    pg.connect(connectionString, function(err, client, done) {
      var handleError = function(err) {
        if(!err) return false;
        done(client);
        next(err);
        return true;

      };
      singleQuote = "'"
      var selectStatement = 'SELECT * FROM (SELECT city_name, cntry_name, pop, pop_rank, ST_AsGeoJSON(cities.geom) AS "geometry", ROW_NUMBER() OVER(PARTITION BY cntry_name ORDER BY pop DESC) AS RowNbr '
      var fromStatement = 'FROM cities INNER JOIN kzone ON ST_Intersects(cities.geom, kzone.geom) INNER JOIN kzone_detailed ON kzone_detailed.climate_zo=kzone.climate_zo '
      var whereStatement = 'WHERE kzone_detailed.name=' + singleQuote +  kzone + singleQuote + ' AND pop <> -999 AND city_name <> ' + singleQuote +  cityname + singleQuote +  ') AS "a" WHERE RowNbr =1 ORDER BY pop_rank LIMIT 15' 
      var queryString = selectStatement + fromStatement + whereStatement;

      client.query(queryString, function(err, result) {

        if(result.rowCount == 0) {
          res.send(500);
        } 
        else {
          var featureCollection = new FeatureCollection();
          for(i=0; i<result.rows.length; i++){
            var feature = new Feature();
            feature.properties = ({"city_name":result.rows[i].city_name, "cntry_name":result.rows[i].cntry_name, "pop":result.rows[i].pop});
            feature.geometry = JSON.parse(result.rows[i].geometry);
            featureCollection.features.push(feature);
          }
          res.type('text/javascript');
          res.jsonp(featureCollection);
          done();
        }
      });
    });
  }
  else{
    res.send("<h2>You need to put a climate zone label in.</h2></br>")
  }
});

app.get('/findKzoneShape', function(req, res){
  console.log(req)
  var kzone = String(req.query.kzone);

  if (kzone != "undefined") {

    pg.connect(connectionString, function(err, client, done) {
      var handleError = function(err) {
        if(!err) return false;
        done(client);
        next(err);
        return true;

      };
      singleQuote = "'"
      var selectStatement = 'SELECT kzone.climate_zo, kzone_detailed.color, kzone_detailed.name, kzone_detailed.main_group, kzone_detailed.description, ST_AsGeoJSON(ST_Union(geom)) AS "geometry" '
      var fromStatement = 'FROM kzone  INNER JOIN kzone_detailed ON kzone_detailed.climate_zo=kzone.climate_zo '
      var whereStatement = 'WHERE kzone_detailed.name=' + singleQuote +  kzone + singleQuote + ' GROUP BY  kzone.climate_zo, kzone_detailed.color, kzone_detailed.name, kzone_detailed.main_group, kzone_detailed.description'
      var queryString = selectStatement + fromStatement + whereStatement;

      client.query(queryString, function(err, result) {

        if(result.rowCount == 0) {
          res.send(500);
        } 
        else {
          var featureCollection = new FeatureCollection();
          for(i=0; i<result.rows.length; i++){
            var feature = new Feature();
            feature.properties = ({"climate_zo":result.rows[i].climate_zo, "name":result.rows[i].name, "maingroup":result.rows[i].maingroup, "color":result.rows[i].color, "description":result.rows[i].description});
            feature.geometry = JSON.parse(result.rows[i].geometry);
            featureCollection.features.push(feature);
          }
          res.type('text/javascript');
          res.jsonp(featureCollection);
          done();
        }
      });
    });
  }
  else{
    res.send("<h2>You need to put a climate zone label in.</h2></br>")
  }
});

app.get('/findKzoneValue', function(req, res){
  console.log(req)
  var city = String(req.query.city);

  if (city != "undefined") {

    pg.connect(connectionString, function(err, client, done) {
      var handleError = function(err) {
        if(!err) return false;
        done(client);
        next(err);
        return true;

      };
      singleQuote = "'"
      var selectStatement = 'SELECT kzone_detailed.climate_zo, kzone_detailed.name, label,  ST_AsGeoJSON(places.geom) AS "geometry" '
      var fromStatement = 'FROM places INNER JOIN kzone ON ST_Intersects(places.geom, kzone.geom) INNER JOIN kzone_detailed ON kzone_detailed.climate_zo=kzone.climate_zo '
      var whereStatement = 'WHERE label=' + singleQuote +  city + singleQuote 
      var queryString = selectStatement + fromStatement + whereStatement;

      client.query(queryString, function(err, result) {

        if(result.rowCount == 0) {
          res.send(500);
        } 
        else {
          var featureCollection = new FeatureCollection();
          for(i=0; i<result.rows.length; i++){
            var feature = new Feature();
            feature.properties = ({"climate_zo":result.rows[i].climate_zo, "name":result.rows[i].name, "city_name":result.rows[i].label});
            feature.geometry = JSON.parse(result.rows[i].geometry);
            featureCollection.features.push(feature);
          }
          res.type('text/javascript');
          res.jsonp(featureCollection);
          done();
        }
      });
    });
  }
  else{
    res.send("<h2>You need to put a climate zone label in.</h2></br>")
  }
});

app.get('/refreshSubgroup', function(req, res){
  console.log(req)
  var maingroup = String(req.query.maingroup);

  if (maingroup != "undefined") {

    pg.connect(connectionString, function(err, client, done) {
      var handleError = function(err) {
        if(!err) return false;
        done(client);
        next(err);
        return true;

      };
      singleQuote = "'"
      var selectStatement = 'SELECT DISTINCT name '
      var fromStatement = 'FROM kzone_detailed  '
      var whereStatement = 'WHERE main_group=' + singleQuote +  maingroup + singleQuote 
      var queryString = selectStatement + fromStatement + whereStatement;

      client.query(queryString, function(err, result) {

        if(result.rowCount == 0) {
          res.send(500);
        } 
        else {
          var featureCollection = new FeatureCollection();
          for(i=0; i<result.rows.length; i++){
            var feature = new Feature();
            feature.properties = ({"name":result.rows[i].name});
            featureCollection.features.push(feature);
          }
          res.type('text/javascript');
          res.jsonp(featureCollection);
          done();
        }
      });
    });
  }
  else{
    res.send("<h2>You need to select a main group.</h2></br>")
  }
});

app.get('/getClimateData', function(req, res){
  console.log(req)
  var kzone = String(req.query.kzone);

  if (kzone != "undefined") {

    pg.connect(connectionString, function(err, client, done) {
      var handleError = function(err) {
        if(!err) return false;
        done(client);
        next(err);
        return true;

      };
      singleQuote = "'"
      var selectStatement = ''
      var fromStatement = ' FROM avg_tempe INNER JOIN kzone_detailed ON kzone_detailed.climate_zo=avg_tempe.climate_zo LEFT JOIN avg_perci ON avg_perci.climate_zo=avg_tempe.climate_zo'
      var whereStatement = ' WHERE kzone_detailed.name=' + singleQuote +  kzone + singleQuote 
      var queryString = (
          'SELECT '+singleQuote+'Monthly average temperature'+singleQuote +' AS t_desc, '+singleQuote+'Monthly'+singleQuote+ ' AS t_label, CAST(avg_monthly AS INT) AS t_value, '+singleQuote+'Monthly average precipitation'+singleQuote +' AS p_desc, ' +singleQuote+'Monthly'+singleQuote+ ' AS p_label, CAST(avg_annual_perci AS INT)/12 AS p_value '+fromStatement+whereStatement+' UNION ALL '+
          'SELECT '+singleQuote+'The hottest monthly average'+singleQuote +' AS t_desc, '+singleQuote+'Warmest'+singleQuote+ ' AS t_label, CAST(avg_hottest AS INT) AS t_value, '+singleQuote+'Driest monthly average precipitation between October and March'+singleQuote +' AS p_desc, ' +singleQuote+'Oct-Mar-D'+singleQuote+ ' AS p_label, CAST(avg_perci_oct_mar_driest AS INT) AS p_value '+fromStatement+whereStatement+' UNION ALL '+
          'SELECT '+singleQuote+'The coldest monthly average'+singleQuote +' AS t_desc, '+singleQuote+'Coldest'+singleQuote+ ' AS t_label, CAST(avg_coldest AS INT) AS t_value, '+singleQuote+'Driest monthly average precipitation between April and September'+singleQuote +' AS p_desc, ' +singleQuote+'Apr-Sep-D'+singleQuote+ ' AS p_label, CAST(avg_perci_apr_sep_driest AS INT) AS p_value '+fromStatement+whereStatement+' UNION ALL '+
          'SELECT '+singleQuote+'Average of the monthly average temperatures between October and March'+singleQuote +' AS t_desc, '+singleQuote+'Oct-Mar'+singleQuote+ ' AS t_label, CAST(avg_oct_mar AS INT) AS t_value, '+singleQuote+'Wettest monthly average precipitation between October and March'+singleQuote +' AS p_desc, ' +singleQuote+'Oct-Mar-W'+singleQuote+ ' AS p_label, CAST(avg_perci_oct_mar_wettest AS INT) AS p_value '+fromStatement+whereStatement+' UNION ALL '+
          'SELECT '+singleQuote+'Average of the monthly average temperatures between April and September'+singleQuote +' AS t_desc, '+singleQuote+'Apr-Sep'+singleQuote+ ' AS t_label, CAST(avg_apr_sep AS INT) AS t_value, '+singleQuote+'Wettest monthly average precipitation between April and September'+singleQuote +' AS p_desc, ' +singleQuote+'Apr-Sep-W'+singleQuote+ ' AS p_label, CAST(avg_perci_apr_sep_wettest AS INT) AS p_value '+fromStatement+whereStatement
      );
      client.query(queryString, function(err, result) {

        if(result.rowCount == 0) {
          res.send(500);
        } 
        else {
          var featureCollection = [];
            for(i=0; i<result.rows.length; i++){
            var feature = ({"t_label":result.rows[i].t_label, "t_value":result.rows[i].t_value, "t_desc":result.rows[i].t_desc, "p_label":result.rows[i].p_label, "p_value":result.rows[i].p_value, "p_desc":result.rows[i].p_desc});
            featureCollection.push(feature);
          }
          res.type('text/javascript');
          res.jsonp(featureCollection);
          done();
        }
      });
    });
  }
  else{
    res.send("<h2>errpr</h2></br>")
  }
});

app.get('/autocompleteLookup', function(req, res){

  var searchText = String(req.query.searchText);
  console.log("Someone using the autocompleteLookup api to look for " + req.query.searchText)

  if (searchText != "undefined") {

    pg.connect(connectionString, function(err, client, done) {
      var handleError = function(err) {
        if(!err) return false;
        done(client);
        next(err);
        return true;
      };
      singleQuote = "'"
      client.query('SELECT DISTINCT label FROM places WHERE Lower("label") ~* ' + singleQuote +  searchText + singleQuote + ' LIMIT 15;', function(err, result) {
        var featureCollection = new FeatureCollection();

        if (result.rows.length > 0){
          for(i=0; i<result.rows.length; i++){
            var feature = new Feature();
            feature.properties = ({"label":result.rows[i].label});
            featureCollection.features.push(feature);
          }
        }
        else {
          var feature = new Feature()
          featureCollection.features.push(feature.properties = ({"geoid": "-999", "name": "no response"}) )
        }
        res.type('text/javascript');
        res.jsonp(featureCollection);
 
        done();
      });
    });
  }
  else{
    res.send("Incorrect Parameters. The following parameters are appropriate:</br><b>searchText</b> - text you want to compare against county dataset</br>")
  }
});


function FeatureCollection(){
    this.type = 'FeatureCollection';
    this.features = new Array();
}

function Feature(){
    this.type = 'Feature';
    this.geometry = new Object;
    this.properties = new Object;
} 

app.listen(8002);
console.log('listening on port 8002');