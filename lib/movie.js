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
    
    Movie.prototype.updateRating = function(newRating, high_precision){
        // new average = old average + (next data - old average) / next count
        var newAvg = (newRating - this.avgRating) / (this.numRating + 1) +
                     this.avgRating;
        
        // Round to nearest 1/2 star if not high precision mode
        if (!high_precision) {
            this.avgRating = Math.round(newAvg*2)/2;
        } else {
            this.avgRating = newAvg;
        }
        
        this.numRating += 1;
    };
    
    Movie.prototype.getCellNum = function(){
        return this.cellNum;
    };

    return Movie;
})();