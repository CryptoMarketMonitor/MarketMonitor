angular.module('cmm.pulse')
.directive('volumeChart', [function () {
  var chartOptions = {
    width: '220',
    height: '220',
    redFrom: 90,
    redTo: 100,
    yellowFrom:75,
    yellowTo: 90
  };  

  return {
    restrict: 'E',
    template: '<div class="col"></div>',
    replace: true,
    scope: {
      data: '='
    },    
    link: function (scope, element, attrs) {

      var drawRangeChart = function(chart, data) {
        google.visualization.events.addListener(chart, 'ready', function () {
            var outerCirc = angular.element(element.find('circle')[0]);
            var text = element.find('text');

            outerCirc.attr('fill', '#ddd');
            outerCirc.attr('stroke', '#ddd');

            angular.forEach(text, function (txt) {
              angular.element(txt).attr('font-family', 'Source Sans Pro');
            });
        });        
        data = google.visualization.arrayToDataTable(data);
        chart.draw(data, chartOptions);
      
      };

      scope.$watch('data', function(newData) {
        if (!newData.percentile) return;

        var chart = new google.visualization.Gauge(element[0]);
        var value = Math.round(newData.percentile * 100);
        var data = [[ 'Label', 'Value' ], [ 'Volume', value ]];

        drawRangeChart(chart, data);
      }, true);       
    }

  };
}]);