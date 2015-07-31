'use strict';

module.exports = (function(){

    function Movie(rating, newCellNum){
        this.avgRating = rating;
        this.numRating = 1;
        this.cellNum = newCellNum;
    }

    Movie.prototype.getNumRating = function(){
        return this.numRating;
    };

    Movie.prototype.getAvgRating = function(){
        return this.avgRating;
    };
    
    Movie.prototype.updateRating = function(newRating){
    	// new average = old average + (next data - old average) / next count
    	var newAvg = (newRating - this.avgRating) / (this.numRating + 1) +
    				 this.avgRating;
        this.avgRating = newAvg;
        this.numRating += 1;
    };
    
    Movie.prototype.getCellNum = function(){
        return this.cellNum;
    };

    return Movie;
})();