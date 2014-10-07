angular.module('cmm.services')
.factory('PriceData', ['Sockets', function (Sockets) {
  var priceSocket = Sockets.priceData;
  var priceData = [];

  priceSocket.on('update', function(data) {
    priceData.splice(0,1,data);
  });

  return priceData;
}]);