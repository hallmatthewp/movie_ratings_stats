var http = require('http');
var body = '';

http.get("http://api-int.test.netflix.com/shakti/hiring?revision=latest", function(res) {
      res.on('data', function(chunk) {
               console.log(chunk);
                });
        res.on('end', function() {
                // all data has been downloaded
                  });
});
