'use strict';

module.exports = (function(){
    var Readable = require('stream').Readable,
        util = require('util'),
        movieIds = [70178217, 70242311, 70271773, 70242310, 70140358, 70258489];

    function RatingStream(){
        Readable.call(this);
    }

    util.inherits(RatingStream, Readable);

    RatingStream.prototype.randomRating = function(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    RatingStream.prototype.randomMovie = function(){
        return movieIds[Math.floor(Math.random() * movieIds.length)];
    };

    RatingStream.prototype._read = function () {
        setImmediate(function() {
            this.push(JSON.stringify({
                movieId: this.randomMovie(),
                rating: this.randomRating(1, 5)
            }));
        }.bind(this));
    };

    return RatingStream;
})();
