var port = process.env.PORT || 3000;
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
  res.sendfile(__dirname + '/public/index.html');
});

app.listen(port, function() {
  console.log('listening on port', port);
});