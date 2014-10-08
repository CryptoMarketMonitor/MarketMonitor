angular.module('cmm.services')
.factory('RangeData', ['Sockets', function (Sockets) {
  var rangeSocket = Sockets.range;
  var range = {};

  rangeSocket.on('update', function(data) {
    range.percentile = data.percentile;
  });

  return range;
}]);