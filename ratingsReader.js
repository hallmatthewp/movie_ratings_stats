'use strict';

// Configuration variables
var STREAM_INTERVAL = 10000, 
	TIME_INTERVAL = 1, // Interval, in secs, between UI refreshes
	LOG_TO_CONSOLE = true,
	PUSH_TO_SHEET = true,
	HIGH_PRECISION_MODE = false;

var MILLISECS_PER_SEC = 1000;

// Store our data
var movies = {},
    Movie = require('./lib/movie'),
    nextCell = 1,
    totalRatings = 0,
    ratingsPerSec = 0,
    lastSampleRatings = 0,
    lastSampleTime = 0;

var http = require('http');
// var readBuf = '';

// Server connection details
var options = {
    hostname: 'localhost',
    port: 7999
};

// Handle the connection to the ratings server
var req = http.request(options, function(res) {
    //console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', readMovieJSON);
    
    // Read in the stream data 
    // res.on('readable', function() {
    //     readBuf = res.read();
    //     console.log(JSON.stringify(readBuf));
    // });
});

req.on('error', function(err) {
    console.log("Problem w/ request: " + err.message);
});

function readMovieJSON(chunk) {
    //console.log(chunk);
    // Check chunk length for intermittent bad JSON reception
    if (chunk.length < 31) {
        return;
    }
    var jsonObj = JSON.parse(chunk),
        curMovieId = jsonObj['movieId'],
        curRating = jsonObj['rating'];
    
    totalRatings++;    
    //console.log(jsonObj);
    //console.log("MovieID: " + jsonObj['movieId'] + ", " +
    //            "Rating: " + jsonObj['rating'] + ", Total: " +
    //            totalRatings);
    
    takeSample();

    if (curMovieId in movies) {
        // The movie has been in our database
        movies[curMovieId].updateRating(curRating, HIGH_PRECISION_MODE);
    } else {
        // The movie hasn't been seen before
        movies[curMovieId] = new Movie(curRating, nextCell++);
    } 
}

function takeSample() {
	// We only take samples if we've surpassed the TIME_INTERVAL 
	var curTime = Date.now();
	if ((curTime - lastSampleTime) > (TIME_INTERVAL * MILLISECS_PER_SEC)) {
		// Update our sample time and sample ratings counters
		
		// ratings/sec = (delta ratings)/(delta time) * ms_per_s
		ratingsPerSec = ((totalRatings - lastSampleRatings) /
						 (curTime - lastSampleTime) *
						 MILLISECS_PER_SEC);
		
		if (!HIGH_PRECISION_MODE) {
			ratingsPerSec = Math.floor(ratingsPerSec);
		}
		
		lastSampleRatings = totalRatings;
		lastSampleTime = curTime;
		dumpData();
	}
}

function dumpData() {
	if (!LOG_TO_CONSOLE) {
		return;
	}
	// Clear the previous movie dump
	process.stdout.write("\u001b[2J\u001b[0;0H");

	console.log("Total Ratings: " + totalRatings);
	console.log("Ratings/Second: " + ratingsPerSec);
	console.log(JSON.stringify(movies, null, 4));
}

// function pushDataToSheet() {
// 	if (!PUSH_TO_SHEET) {
// 		return;
// 	}
// 	var Spreadsheet = require('edit-google-spreadsheet');
// 	Spreadsheet.load({
// 		debug: true,
// 		spreadsheetName: 'Movie Ratings Test1',
// 		worksheetName: 'Sheet1',
// 		
// 		oauth2: {
//             client_id: 'generated-id.apps.googleusercontent.com',
//             client_secret: 'generated-secret',
//             refresh_token: 'token generated with get_oauth2_permission.js'
//         },
//         
//         
//     },
// }
// Load up the google sheet
// var Spreadsheet = require('edit-google-spreadsheet');
// 
// Spreadsheet.load({
//     debug: true,
//     spreadsheetName: 'Movie Ratings Test1

// Kick things off
lastSampleTime = Date.now();
console.log("---------- Initializing ----------");
req.end();