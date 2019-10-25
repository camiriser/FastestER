// Import express (Framework).
var express = require("express");
var app = express();

//Import mongoosse (Framework for mongoDB) and conect to the Data Base.
var mongoose = require("mongoose");
/*var options = {
    useNewUrlParser: true,
    user: "xxxxxxxx",
    pass: "xxxxxxxx
};*/
//mongoose.connect("mongodb://localhost:27017/emergency_department_app?authSource=admin", options);
var options = {
    useNewUrlParser: true
};

mongoose.connect("mongodb+srv://UserName:Password@cluster0-b6jve.mongodb.net/fastest_er", options);

var info = require("./models/info");

var bodyParser  = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Import Unirest, is a package that allow to make request from node is like request but require by the API used here.
var unirest = require('unirest');

// Import request, is a package that allow to make request from node.
var request = require("request");

// Import async, is a package allow us to use async.map, that allow to make multiple calls to the API, in a single GET request)
var async = require("async");

//Is fundamental to be able to use CSS.
app.use(express.static(__dirname + "/public"));

//Short cut for naming the views
app.set("view engine", "ejs");

    
    //PROFILE ROUTE (PRIVATE)
    
        app.get("/", function(req, res){
           res.render("search");
        });
 
    
    //RESULTS ROUTE
        app.get("/results", function(req, res){
        
            var all = [];
            var url;
            var address;
            var hospitalName;
            var id;
            var i =0;
            
            
            info.find({}, function(err, res){
                if(err)
                    console.log(err);
                else   
                    callNext(res);
            });
            
            function callNext(res) {
                if (i >= res.length) {
                    requestEnded(all);
                } else {
                    address = res[i].Address.replace(/ /g, "+") + "+" + res[i].City + "+" + res[i].State  + "+" + res[i].ZIP_Code;
                    hospitalName = res[i].Hospital_Name;
                    id = res[i].Provider_ID;
                    console.log(hospitalName);
                    url = "https://geocoder.api.here.com/6.2/geocode.json?app_id=XV9nu4qDJYhlaLhKiVtx&app_code=cHz8yt6_ANtUh_CaRAcSqQ&searchtext=" + address;
                    request(url, i++, function(error, response, body){
                        if(!error && response.statusCode == 200 ){
                            var data = JSON.parse(body);
                            all.push(data["Response"]["View"][0].Result[0].Location.DisplayPosition.Longitude);
                           // all.push([data["Response"]["View"][0].Result[0].Location.DisplayPosition.Latitude, data["Response"]["View"][0].Result[0].Location.DisplayPosition.Longitude]);
                            callNext(res);   
                        }
                    });
                }
            }
            
            function requestEnded(x) {
                res.send(x);
            }

        });
        
        app.get("/route", function(req, res){
          
            
            //var zips = [20010, 20017, 20016, 21239];
            var zips = [];
            var all = [];
            var url;
            var i = 0, j = 0, k = 0, t;
            var coordinates;
            var hospitalInfo = [];
            var query_zip = req.query.search_zip;
            var query_radius = req.query.search_radius;
            var result;
            var origen;
            
            url = "https://api.zip-codes.com/ZipCodesAPI.svc/1.0/QuickGetZipCodeDetails/" + req.query.search_zip + "?key=xxxxxxxxxxxxxxx";
            
             request(url, function(error, response, body){
                if(!error && response.statusCode == 200 ){
                    var data = JSON.parse(body.replace(/\s/g, ''));
                    //console.log( result["DataList"].length + result["DataList"]);
                    origen = data["Latitude"] + "," + data["Longitude"];
                    console.log(origen);
                }
            });
            
            url = "https://api.zip-codes.com/ZipCodesAPI.svc/1.0/FindZipCodesInRadius?zipcode="+ query_zip + "&minimumradius=0&maximumradius=" + query_radius + "&key=xxxxxxxxxxxxxxxxxxxxxxx";
           
            request(url, function(error, response, body){
                if(!error && response.statusCode == 200 ){
                    result = JSON.parse(body.replace(/\s/g, ''));
                    //console.log( result["DataList"].length + result["DataList"]);
                    getZIPS();
                }
            });
            
            
            function getZIPS(){
                if (k >= result["DataList"].length) {
                    callNextZIP();
                }else{
                    zips.push(result["DataList"][k].Code);
                    k ++;
                    getZIPS();
                }
            }

            console.log(zips.length);
          
            function callNextZIP() {
                if (j >= zips.length) {
                    console.log(hospitalInfo.length);
                    callNext(hospitalInfo);
                } else {
                    info.find({ZIP_Code: zips[j]}, function(err, res){
                        if(err)
                            console.log(err);
                        for(t = 0; t < res.length; t++){
                            hospitalInfo.push(res[t]);
                        }
                        //console.log(hospitalInfo);
                        j++;
                        callNextZIP();
                    });
                }
            }

            function callNext(res) {
                if (i >= res.length) {
                    requestEnded(all);
                } else {
                    coordinates= res[i].Latitude + "," + res[i].Longitude;
                    console.log(coordinates);
                    url =  "https://route.api.here.com/routing/7.2/calculateroute.json?app_id=xxxxxxxxxxxxxxxxx&app_code=xxxxxxxxxxxxxxx&waypoint0=geo!" + origen + "&waypoint1=geo!" + coordinates + "&mode=fastest;car;traffic:disabled";
                    request(url, i++, function(error, response, body){
                        if(!error && response.statusCode == 200 ){
                            var data = JSON.parse(body);
                            //console.log(data);
                            all.push([res[i-1], data]);
                            callNext(res);
                        }
                    });
                }
            }
            
            function requestEnded(x) {
                //res.send(x);
                res.render("route", {data: x});
            }
 
        });
        
            app.get("/test", function(req, res){
                var url;
                 url = "https://geocoder.api.here.com/6.2/geocode.json?housenumber=1345&street=chapman&city=dc&country=usa&gen=9&app_id=xxxxxxxxxxx&app_code=xxxxxxxxxxx";
                    request(url, function(error, response, body){
                    if(!error && response.statusCode == 200 ){
                        var data = JSON.parse(body);
                        console.log(data);
                        res.send(data);
                        }
                });
            });
        
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("ED App has started!!!");
});
