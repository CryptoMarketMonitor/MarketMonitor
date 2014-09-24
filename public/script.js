
// load google charts
google.load("visualization", "1", {packages:["corechart", "gauge"]});

// Cache jquery variables for easy reference
var $headerRow = $('tr.headerRow:first');
var $tradeSizeFilter = $('input.tradeSizeFilter');
var $high = $('div.high');
var $low = $('div.low');
var $vwap = $('div.vwap');
var $btcVolume = $('div.btcVolume');
var $volatility = $('div.volatility');
var $range = $('div.range');
var $numTrades = $('div.numTrades');
var $usdVolume = $('div.usdVolume');
var $aveTrade = $('div.aveTrade');
var tradeCount = 0;
var maxTrades = 20;
var digits = 2; // Number of digits for formatting price and ammount

// Google Charts variables
var chartsReady = false;

// Price Distribution Chart
var priceDistChart;
var rawPriceDistData;
var priceDistData;
var priceDistOptions = {
    hAxis: { title: 'Price' },
    vAxis: { title: 'Quantity' },
    theme: 'maximized',
    isStacked: true
};

//Price Chart
var priceChart;
var rawPriceChartData;
var priceChartData;
var priceChartOptions = {
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

// Volume Chart
var volumeChart;
var volumeChartData;
var volumeChartOptions = {
  chartArea: { width: '100%', height: '100%' },
  axisTitlesPosition: 'in',
  legend: 'none',
  hAxis: { textPosition: 'in' },
  vAxis: { title: 'BTC Volume', textPosition: 'in' },
  tooltip: { isHtml: true },
  crosshair: { trigger: 'selection' }
};

// Market Stability Charts
var coefficientOfVariationChart;
var rawCoefficientOfVariationData;
var coefficientOfVariationData;
var rangeChart;
var rawRangeData;
var rangeData;
var volumeGaugeChart;
var rawVolumeGaugeData;
var volumeGaugeData;
var gaugeChartOptions = {
  width: '220',
  height: '220',
  redFrom: 90,
  redTo: 100,
  yellowFrom:75,
  yellowTo: 90
};

// Trade Formatting logic
var template = _.template('<tr class="trade"><td><%=hours%>:<%=minutes%>:<%=seconds%></td><td><%=price%></td><td><%=amount%></td><td><%=usd%></td><td><%=exchange%></td></tr>');
var formatTrade = function(trade) {
  var fTrade = {};
  var date = new Date(trade.date);
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  fTrade.hours = '' + date.getHours();
  fTrade.minutes = minutes < 10 ? '0' + minutes : '' + minutes;
  fTrade.seconds = seconds < 10 ? '0' + seconds : '' + seconds;
  fTrade.price = trade.price.toFixed(digits);
  fTrade.amount = trade.amount.toFixed(digits);
  fTrade.usd = '$' + (trade.price * trade.amount).toFixed(digits);
  fTrade.exchange = trade.exchange;
  return fTrade;
};

var removeOldestTrade = function() {
  $('table.table tr:last-child').remove();
  tradeCount--;
};

var addTrade = function(trade) {
  trade = formatTrade(trade);
  $headerRow.after(template(trade));
  tradeCount++;
  if (tradeCount > maxTrades) {
    removeOldestTrade();
  }
};

////////////////////////////////////////////////////////////////
// This is the part of the app that connects with the server.
////////////////////////////////////////////////////////////////

var trades = io('http://api.marketmonitor.io:80/BTC/USD/trades');
trades.on('trade', function(trade) {
  addTrade(trade);
});

var summary = io('http://api.marketmonitor.io:80/BTC/USD/summary');
summary.on('update', function(data) {
  $high.text('$' + data.high.toFixed(digits));
  $low.text('$' + data.low.toFixed(digits));
  $vwap.text('$' + data.vwap.toFixed(digits));
  $btcVolume.text(Math.round(data.volume).toLocaleString() + ' BTC');
  $usdVolume.text('$' + Math.round(data.volume * data.vwap).toLocaleString());
  $range.text((data.range * 100).toFixed(digits) + '%');
  $volatility.text((data.coefficientOfVariation * 100).toFixed(digits) + '%');
  $numTrades.text(Math.round(data.numTrades).toLocaleString());
  $aveTrade.text((data.volume / data.numTrades).toFixed(digits) + ' BTC');
});

var priceDistribution = io('http://api.marketmonitor.io:80/BTC/USD/priceDistribution');
priceDistribution.on('update', function(data) {
  rawPriceDistData = processPriceDistData(data);
  if (chartsReady) {
    drawPriceDistChart();
  }
});

var priceData = io('http://api.marketmonitor.io:80/BTC/USD/priceCharts/fifteenMinutes');
priceData.on('update', function(data) {
  rawPriceChartData = processPriceChartData(data);
  if (chartsReady) {
    drawPriceChart();
  }
});

// Market Stability Data
var coefficientOfVariation = io('http://api.marketmonitor.io:80/BTC/USD/coefficientOfVariation');
coefficientOfVariation.on('update', function(data) {
  var value = Math.round(data.percentile * 100);
  rawCoefficientOfVariationData = [[ 'Label', 'Value' ], [ 'Volatility', value ]];
  if (chartsReady) {
    drawCoefficientOfVariationChart();
  }
});

var rangeDetails = io('http://api.marketmonitor.io:80/BTC/USD/range');
rangeDetails.on('update', function(data) {
  var value = Math.round(data.percentile * 100);
  rawRangeData = [[ 'Label', 'Value' ], [ 'Range', value ]];
  if (chartsReady) {
    drawRangeChart();
  }
});

var volumeDetails = io('http://api.marketmonitor.io:80/BTC/USD/volume');
volumeDetails.on('update', function(data) {
  var value = Math.round(data.percentile * 100);
  rawVolumeGaugeData = [[ 'Label', 'Value' ], [ 'Volume', value ]];
  if (chartsReady) {
    drawVolumeGaugeChart();
  }
});

////////////////////////////////////////////////////////////////
// This sets up the google chart.                             
////////////////////////////////////////////////////////////////


google.setOnLoadCallback(function() {
  chartsReady = true;

  // Price Distribution Chart Setup
  priceDistChart = new google
    .visualization
    .ColumnChart(document.getElementById('priceDistChart'));
  if (rawPriceDistData) { drawPriceDistChart(); }

  // Price Chart Setup
  priceChart = new google
    .visualization
    .LineChart(document.getElementById('priceChart'));
  volumeChart = new google
    .visualization
    .AreaChart(document.getElementById('volumeChart'));
  if (rawPriceChartData) { drawPriceChart(); }

  // Market Stability Setup
  coefficientOfVariationChart = new google
    .visualization
    .Gauge(document.getElementById('coefficientOfVariationChart'));
  if (rawCoefficientOfVariationData) { drawCoefficientOfVariationChart(); }
  rangeChart = new google
    .visualization
    .Gauge(document.getElementById('rangeChart'));
  if(rawRangeData) { drawRangeChart(); }
  volumeGaugeChart = new google
    .visualization
    .Gauge(document.getElementById('volumeGaugeChart'));
  if (rawVolumeGaugeData) { drawVolumeGaugeChart(); }

  // Set Charts Event Listeners
  // This will enable the price chart and the volume chart to share crosshairs
  google.visualization.events.addListener(priceChart, 'select', function() {
    volumeChart.setSelection(priceChart.getSelection());
  });
  google.visualization.events.addListener(volumeChart, 'select', function() {
    priceChart.setSelection(volumeChart.getSelection());
  });

});

$tradeSizeFilter.change(function() {
  minTrade = $tradeSizeFilter.val();
  socket.emit('getTrades', minTrade);
});

var drawPriceDistChart = function() {
  priceDistData = google.visualization.arrayToDataTable(rawPriceDistData);
  priceDistChart.draw(priceDistData, priceDistOptions);
};

var drawCoefficientOfVariationChart = function() {
  coefficientOfVariationData = google.visualization.arrayToDataTable(rawCoefficientOfVariationData);
  coefficientOfVariationChart.draw(coefficientOfVariationData, gaugeChartOptions);
};

var drawRangeChart = function() {
  rangeData = google.visualization.arrayToDataTable(rawRangeData);
  rangeChart.draw(rangeData, gaugeChartOptions);
};

var drawVolumeGaugeChart = function() {
  volumeGaugeData = google.visualization.arrayToDataTable(rawVolumeGaugeData);
  volumeGaugeChart.draw(volumeGaugeData, gaugeChartOptions);
};

var drawPriceChart = function() {
  priceChartData = new google.visualization.DataTable(rawPriceChartData.price);
  volumeChartData = new google.visualization.DataTable(rawPriceChartData.volume);
  priceChart.draw(priceChartData, priceChartOptions);
  volumeChart.draw(volumeChartData, volumeChartOptions);
};
var tooltipTemplate = _.template('<div class="price-chart-tooltip">' +
                                 '<b><%= date %></b><br>' +
                                 'VWAP: <b><%= vwap.toFixed(2) %></b><br>' + 
                                 'High: <b><%= high.toFixed(2) %></b><br>' +
                                 'Low: <b><%= low.toFixed(2) %></b><br>' +
                                 'Volume: <b><%= volume.toFixed(2) %></b><br>' +
                                 '</div>');
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
        {v: tooltipTemplate(el) }
      ] } );

    dataTable.volume.rows.push(
      { c: [
        { v: el.date },
        { v: el.volume },
        { v: tooltipTemplate(el) }
      ] } );
  });
  return dataTable;
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