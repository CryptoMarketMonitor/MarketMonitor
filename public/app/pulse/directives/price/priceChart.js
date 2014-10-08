angular.module('cmm.pulse')
.directive('priceChart', ['$filter', function ($filter) {
  var chartOptions = {
    chartArea: { width: '100%', height: '100%' },
    axisTitlesPosition: 'in',
    legend: 'none',
    vAxis: { title: 'USD Price per BTC', textPosition: 'in' },
    hAxis: { textPosition: 'in' },
    curveType: 'function',
    intervals: { style: 'area' },
    tooltip: { isHtml: true },
    crosshair: { trigger: 'selection' }
  };

  return {
    restrict: 'E',
    template: '<div class="col-chart"></div>',
    replace: true,
    scope: {
      data: '='
    },
    link: function (scope, element, attrs) {
      var rawPriceData, priceChart;

      var processPriceChartData = function(data) {
        var dataTable = {};
        dataTable.price = {};
        dataTable.volume = {};
        dataTable.price.cols = [
          { id: 'date', label: 'Date', type: 'datetime' },
          { id: 'vwap', label: 'VWAP', type: 'number' },
          { id: 'high', type: 'number', role: 'interval' },
          { id: 'low', type: 'number',  role: 'interval' },
          { id: 'tooltip', type: 'string', role: 'tooltip', p: { html: true } }
        ];
        dataTable.price.rows = [];
        dataTable.volume.cols = [
          { id: 'date', label: 'Date', type: 'datetime' },
          { id: 'volume', label: 'Volume', type: 'number' },
          { id: 'tooltip', type: 'string', role: 'tooltip', p: { html: true } }
        ];
        dataTable.volume.rows = [];
        data.forEach(function(el) {
          el.date = new Date(el.date);
          dataTable.price.rows.push(
            { c: [ 
              { v: el.date },
              { v: el.vwap },
              { v: el.high },
              { v: el.low },
              { v: '<div class="chart-tooltip"><b>' + $filter('date')(el.date) + '</b><br>VWAP: <b>' + $filter('currency')(el.vwap) + '</b><br>  High: <b>' + $filter('currency')(el.high) + '</b><br> Low: <b>' + $filter('currency')(el.low) + '</b><br> Volume: <b>' + $filter('number')(el.volume, 2) + '</b><br></div>' }
            ] } );  

          dataTable.volume.rows.push(
            { c: [
              { v: el.date },
              { v: el.volume },
              { v: '<div class="chart-tooltip"><b>' + $filter('date')(el.date) + '</b><br>  High: <b>' + $filter('currency')(el.high) + '</b><br> Low: <b>' + $filter('currency')(el.low) + '</b><br> Volume: <b>' + $filter('number')(el.volume, 2) + '</b><br></div>' }
            ] } );
        });
        return dataTable;
      };

      var drawPriceChart = function() {
        var priceChartData = new google.visualization.DataTable(rawPriceData.price);
        priceChart.draw(priceChartData, chartOptions);
      };

      scope.$watch('data', function(newData, old) {
        newData = newData[0];

        if (newData && newData.length) {
          rawPriceData = processPriceChartData(newData);
          priceChart = new google.visualization.LineChart(element[0]);

          if (rawPriceData) drawPriceChart();
        }     
      }, true);
    }
  };
}]);