angular.module('pulse.services')
.factory('SummaryData', ['Sockets', function (Sockets) {
  var socket = Sockets.summary;
  var summaryData = {};

  socket.on('update', function(data) {
    summaryData.lastUpdate = (new Date()).toISOString();

    summaryData.high = data.high.toFixed(2);
    summaryData.low = data.low.toFixed(2);
    summaryData.range = (data.range * 100);

    summaryData.vwap = data.vwap.toFixed(2);
    summaryData.volumeBTC = Math.round(data.volume);
    summaryData.volumeUSD = Math.round(data.volume * data.vwap);

    summaryData.volatility = (data.coefficientOfVariation * 100);
    summaryData.numTrades = Math.round(data.numTrades);
    summaryData.avgTrade = (data.volume / data.numTrades);

    summaryData.isLoaded = true;

  });  

  return summaryData;
}]);