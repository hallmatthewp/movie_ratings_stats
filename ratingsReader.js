// ratingsReader.js - Netflix Take Home Exercise
// Connect to streamingServer, read and aggregate movie rating data
// Author: Matthew Hall

'use strict';

// Configuration variables
var TIME_INTERVAL = 2.5, // Interval, in secs, between UI refreshes
    LOG_TO_CONSOLE = true,
    PUSH_TO_SHEET = true,
    USE_SET_INTERVAL = true,
    HIGH_PRECISION_MODE = true;

// Constants
var MILLISECS_PER_SEC = 1000,
    MOVIE_ID_COL = 1,
    MOVIE_AVG_COL = 2,
    MOVIE_CNT_COL = 3,
    RATINGS_CNT_COL = 5,
    RATINGS_PER_SEC_COL = 6,
    STATS_ROW = 2;

// Movie entry data
var movies = {},
    Movie = require('./lib/movie'),
    nextCell = 2; // Begin writing data below our column title

// Global stats data
var stats = {
    totalRatings: 0,
    ratingsPerSec: 0,
    lastSampleRatings: 0,
    lastSampleTime: 0
};

// Server connection details
var http = require('http');
var options = {
    hostname: 'localhost',
    port: 7999
};

// Setup the connection to the ratings server
var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', readMovieJSON);
    res.on('end', function() {
        console.log("Download complete");
    });
});

req.on('error', function(err) {
    console.log("Problem w/ request: " + err.message);
});

// Kick things off
stats.lastSampleTime = Date.now();
if (LOG_TO_CONSOLE) {
    console.log("---------- Initializing ----------");
}

// Make the request
req.end();

if (USE_SET_INTERVAL) {
    setInterval(takeSample, TIME_INTERVAL * MILLISECS_PER_SEC);
}
function readMovieJSON(chunk) {
    // Check chunk length for intermittent bad JSON reception
    if (chunk.length < 31) {
        // Drop payload if the JSON is incomplete
        return;
    }

    // Parse the JSON payload and ensure it parsed correctly
    var jsonObj = JSON.parse(chunk);
    if (typeof jsonObj === 'undefined') {
        console.log("Error: Bad JSON parse");
        return;
    }
    var curMovieId = jsonObj['movieId'],
        curRating = jsonObj['rating'];
    stats.totalRatings++;
    if (!USE_SET_INTERVAL) {   
        takeSample();
    }

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
    if ((curTime - stats.lastSampleTime) > (TIME_INTERVAL * MILLISECS_PER_SEC)) {
        // Update our sample time and sample ratings counters
        
        // ratings/sec = (delta ratings)/(delta time in ms) * ms_per_s
        stats.ratingsPerSec  = ((stats.totalRatings - stats.lastSampleRatings) /
                                (curTime - stats.lastSampleTime) *
                                MILLISECS_PER_SEC);
        
        if (!HIGH_PRECISION_MODE) {
            stats.ratingsPerSec  = Math.floor(stats.ratingsPerSec );
        }
        
        stats.lastSampleRatings = stats.totalRatings;
        stats.lastSampleTime = curTime;
        dumpData();
        pushDataToSheet();
    }
}

function dumpData() {
    if (!LOG_TO_CONSOLE) {
        return;
    }
    
    // Clear the previous movie dump on the console
    // This was taken from stack overflow :)
    process.stdout.write("\u001b[2J\u001b[0;0H");
    
    if (HIGH_PRECISION_MODE) {
        console.log("---=== High Precision Mode Enabled ===---");
    }
    console.log("Total Ratings: " + stats.totalRatings);
    console.log("Ratings/Second: " + stats.ratingsPerSec );
    console.log(JSON.stringify(movies, null, 4));
}

function pushDataToSheet() {
    if (!PUSH_TO_SHEET) {
        return;
    }
    var Spreadsheet = require('edit-google-spreadsheet');
    Spreadsheet.load({
        debug: LOG_TO_CONSOLE,
        spreadsheetId: "18pigTsw6OW7Vv3unFI-J7GFn-m45O2caxQk_bN7nkys",
        worksheetId: "od6",
        
        oauth: {
            email: '131931030938-60ov9erojskbui3hv1ejggik6v7kstgh@developer.gserviceaccount.com',
            keyFile: './crypt/google-oauth.pem'
        }
    }, function sheetReady(err, spreadsheet) {
        if (err) {
            console.log("Error: " + err);
            return;
        }
        
        // Initialize our spreadsheet update object
        var sheetData = {};
        sheetData[STATS_ROW] = {};

        for (var movieId in movies) {
            // Build our spreadsheet update object from each movie in our data
            var row = movies[movieId].getCellNum();
            if (typeof row === 'number') {
                sheetData[row] = {};
                sheetData[row][MOVIE_ID_COL] = movieId;
                sheetData[row][MOVIE_AVG_COL] = movies[movieId].getAvgRating();
                sheetData[row][MOVIE_CNT_COL] = movies[movieId].getNumRating();    
            }
        }
        
        // Add the global stats to the spreadsheet update object
        sheetData[STATS_ROW][RATINGS_CNT_COL] = stats.totalRatings;
        sheetData[STATS_ROW][RATINGS_PER_SEC_COL] = stats.ratingsPerSec;
        
        spreadsheet.add(sheetData);
        spreadsheet.send(function(err) {
            if(err) {
                console.log("Error: " + err);
                return;
            }
            if (LOG_TO_CONSOLE) {
                console.log("Updated Spreadsheet");
            }
        });
    });
}