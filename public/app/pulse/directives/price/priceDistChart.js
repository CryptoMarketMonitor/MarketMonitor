angular.module('cmm.pulse')
.directive('priceDistChart', ['Sockets', function (Sockets) {
  var chartOptions = {
      hAxis: { title: 'Price' },
      vAxis: { title: 'Quantity' },
      theme: 'maximized',
      isStacked: true
  };

  var processPriceDistData = function(data) {
    var exchanges = ['Exchanges'];
    var prices = [];
    var dataTable = [];
    data.forEach(function(el) {
      if (!_.contains(exchanges, el.exchange)) {
        exchanges.push(el.exchange);
      }
      if (!_.contains(prices, el.price)) {
        prices.push(el.price);
      }
    });
    exchanges.push({role: 'annotation'});
    dataTable.push(exchanges);
    prices.forEach(function(price) {
      var row = [price];
      for (var i = 1; i < exchanges.length - 1; i++) {
        row.push(0);
      }
      row.push('');
      dataTable.push(row);
    });

    data.forEach(function(el) {
      var x = exchanges.indexOf(el.exchange);
      var y = prices.indexOf(el.price) + 1;
      dataTable[y][x] = Number(el.volume.toFixed(2));
    });
    return dataTable;
  };    

  return {
    restrict: 'E',
    template: '<div class="col-chart"></div>',
    replace: true,
    scope: {
      data: '='
    },    
    link: function (scope, element, attrs) {
      var rawPriceDistData, priceDistChart;

      var drawPriceDistChart = function() {
        var priceDistData = google.visualization.arrayToDataTable(rawPriceDistData);
        priceDistChart.draw(priceDistData, chartOptions);
      };

      scope.$watch('data', function(newData, old) {
        newData = newData[0];

        if (newData && newData.length) {
          rawPriceDistData = processPriceDistData(newData);
          priceDistChart = new google
            .visualization
            .ColumnChart(element[0]);

          if (rawPriceDistData) { drawPriceDistChart(); }      
        }     
      }, true);
    }
  };
}]);