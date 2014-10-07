angular.module('pulse.services')
.factory('COVData', ['Sockets', function (Sockets) {
  var covSocket = Sockets.cov;
  var cov = {};

  covSocket.on('update', function(data) {
    cov.percentile = data.percentile;
  });

  return cov;
}]);