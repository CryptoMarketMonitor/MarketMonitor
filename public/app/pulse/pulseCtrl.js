angular.module('cmm.pulse')
.controller('PulseCtrl', ['$scope', 'MarketData', function ($scope, MarketData) {
  console.log('instantiated PulseCtrl')
  $scope.chartData = {};
  
  $scope.summary = MarketData.summary;
  window.md = MarketData;
  $scope.chartData.cov = MarketData.cov;
  $scope.chartData.range = MarketData.range;
  $scope.chartData.volume = MarketData.volume;
  $scope.chartData.price = MarketData.price;
  $scope.chartData.btcVolume = MarketData.price;
  $scope.chartData.priceDist = MarketData.priceDist;

}]);