var port = process.env.PORT || 3000;
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.route('/*')
  .get(function(req, res) {
    res.sendfile('/public/index.html');
  });

app.listen(port, function() {
  console.log('listening on port', port);
});