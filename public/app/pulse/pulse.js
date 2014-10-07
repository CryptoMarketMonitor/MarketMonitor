angular.module('cmm.pulse', ['pulse.services', 'ui.router'])
.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {  
  $stateProvider
    .state('pulse', {
      url: '/pulse',
      templateUrl: './app/pulse/pulse.html',
      controller: 'PulseCtrl'
    });
    $urlRouterProvider.otherwise('/pulse');
}]);