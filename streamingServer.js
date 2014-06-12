var http = require('http'),
    RatingReadStream = require('./lib/ratingReadStream'),
    port = 7999,
    ratingStream = new RatingReadStream();

http.createServer(function(req, res){

    console.log('*** User connected ***');
    res.on('close', function(){console.log('*** User disconnected ***');});
    ratingStream.pipe(res);

}).listen(port, function(){
    console.log('Rating Streaming Server started on port:', port);
});