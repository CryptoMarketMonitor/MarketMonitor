angular.module('cmm.tape', ['ui.router', 'cmm.services'])
.config(function ($stateProvider, $urlRouterProvider) {  
  $stateProvider
    .state('tape', {
      url: '/tape',
      templateUrl: './app/tape/tape.html',
      controller: 'TapeCtrl'
    });

    $urlRouterProvider.otherwise('/pulse');
})
.controller('TapeCtrl', ['$scope', 'MarketData', function ($scope, MarketData) {
  $scope.tape = MarketData.trades.tape;
}]);