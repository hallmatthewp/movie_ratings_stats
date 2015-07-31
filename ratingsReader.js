'use strict';

// Store our data
var movies = {},
	Movie = require('./lib/movie'),
	nextCell = 1,
	totalRatings = 0;

var http = require('http');
// var readBuf = '';

// Server connection details
var options = {
	hostname: 'localhost',
	port: 7999
};

// Handle the connection to the ratings server
var req = http.request(options, function(res) {
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));
	res.setEncoding('utf8');
	res.on('data', readMovieJSON);
	
	// Read in the stream data 
	// res.on('readable', function() {
	//     readBuf = res.read();
	//     console.log(JSON.stringify(readBuf));
	// });
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
	//			"Rating: " + jsonObj['rating'] + ", Total: " +
	//			totalRatings);
	
	dumpMovies();

	if (curMovieId in movies) {
		// The movie has been in our database
		movies[curMovieId].updateRating(curRating);
	} else {
		// The movie hasn't been seen before
		movies[curMovieId] = new Movie(curRating, nextCell++);
	} 
}

function dumpMovies() {
	if (totalRatings % 10000 == 0) {
		console.log("Total Ratings: " + totalRatings);
		console.log(JSON.stringify(movies, null, 4));
	}
}

req.on('error', function(err) {
	console.log("Problem w/ request: " + err.message);
});

// Load up the google sheet
// var Spreadsheet = require('edit-google-spreadsheet');
// 
// Spreadsheet.load({
// 	debug: true,
// 	spreadsheetName: 'Movie Ratings Test1

// Kick things off
req.end();