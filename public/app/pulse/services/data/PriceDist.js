angular.module('pulse.services')
.factory('PriceDistData', ['Sockets', function (Sockets) {
  var priceDistSocket = Sockets.priceDist;
  var priceDistData = [];

  priceDistSocket.on('update', function(data) {
    priceDistData.splice(0,1,data);
  });

  return priceDistData;
}]);