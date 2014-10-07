angular.module('pulse.services')
.factory('VolumeData', ['Sockets', function (Sockets) {
  var volumeSocket = Sockets.volume;
  var volume = {};

  volumeSocket.on('update', function(data) {
    volume.percentile = data.percentile;
  });

  return volume;
}]);