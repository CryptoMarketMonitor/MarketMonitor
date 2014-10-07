angular.module('cmm.tape', ['ui.router', 'cmm.sockets'])
.config(function ($stateProvider, $urlRouterProvider) {  
  $stateProvider
    .state('tape', {
      url: '/tape',
      templateUrl: './app/tape/tape.html',
      controller: 'TapeCtrl'
    });

    $urlRouterProvider.otherwise('/pulse');
})
.factory('Trades', ['Sockets', function (Sockets) {
  var tape = [];
  var trades = Sockets.trades;
  
  var formatTrade = function(trade) {
    var fTrade = {};
    var date = new Date(trade.date);
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    
    fTrade.hours = '' + date.getHours();
    fTrade.minutes = minutes < 10 ? '0' + minutes : '' + minutes;
    fTrade.seconds = seconds < 10 ? '0' + seconds : '' + seconds;
    fTrade.price = trade.price;
    fTrade.amount = trade.amount;
    fTrade.usd = '$' + (trade.price * trade.amount);
    fTrade.exchange = trade.exchange;
    return fTrade;
  };

  trades.on('trade', function(trade) {
    tape.unshift(formatTrade(trade));
    if (tape.length > 20) tape.pop();
  });

  return {
    tape: tape,
  };
}])
.controller('TapeCtrl', ['$scope', 'Trades', function ($scope, Trades) {
  $scope.tape = Trades.tape;
}]);