angular.module('cmm.pulse')
.controller('PulseCtrl', ['$scope', 'MarketData', function ($scope, MarketData) {
  console.log('instantiated PulseCtrl')
  $scope.chartData = {};
  console.log(MarketData)
  $scope.summary = MarketData.summary;
  
  $scope.chartData.cov = MarketData.cov;
  $scope.chartData.range = MarketData.range;
  $scope.chartData.volume = MarketData.volume;
  $scope.chartData.price = MarketData.price;
  $scope.chartData.btcVolume = MarketData.price;
  $scope.chartData.priceDist = MarketData.priceDist;

}]);