
// load google charts
google.load("visualization", "1", {packages:["corechart"]});

// Cache jquery variables for easy reference
var $headerRow = $('tr.headerRow:first');
var $tradeSizeFilter = $('input.tradeSizeFilter');
var $high = $('span.high');
var $low = $('span.low');
var $vwap = $('span.vwap');
var $volume = $('span.volume');
var $volatility = $('span.volatility');
var $range = $('span.range');
var digits = 2; // Number of digits for formatting price and ammount

// Google Charts variables
var chartsReady = false;
var priceDistChart;
var rawPriceDistData;
var priceDistData;
var priceDistOptions = {
    hAxis: { title: 'Price' },
    vAxis: { title: 'Quantity' },
    theme: 'maximized',
    isStacked: true
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

var addTrade = function(trade) {
  trade = formatTrade(trade);
  $headerRow.after(template(trade));
};

////////////////////////////////////////////////////////////////
// This is the part of the app that connects with the server. //
////////////////////////////////////////////////////////////////

var trades = io('http://broadcastserver.azurewebsites.net:80/BTC/USD/trades');
trades.on('trade', function(trade) {
  addTrade(trade);
});

var summary = io('http://broadcastserver.azurewebsites.net:80/BTC/USD/summary');
summary.on('update', function(data) {
  $high.text(data.high.toFixed(digits));
  $low.text(data.low.toFixed(digits));
  $vwap.text(data.vwap.toFixed(digits));
  $volume.text(data.volume.toFixed(digits));
  $range.text((data.range * 100).toFixed(digits) + '%');
  $volatility.text(data.variance.toFixed(digits));
});

var priceDistribution = io('http://broadcastserver.azurewebsites.net:80/BTC/USD/priceDistribution');
priceDistribution.on('update', function(data) {
  rawPriceDistData = processPriceDistData(data);
  if (chartsReady) {
    drawPriceDistChart();
  }
});



////////////////////////////////////////////////////////////////
// This sets up the google chart.                             //
////////////////////////////////////////////////////////////////


google.setOnLoadCallback(function() {
  priceDistChart = new google
    .visualization
    .ColumnChart(document.getElementById('priceDistChart'));
  chartsReady = true;
  if (rawPriceDistData) drawPriceDistChart();
});

$tradeSizeFilter.change(function() {
  minTrade = $tradeSizeFilter.val();
  socket.emit('getTrades', minTrade);
});

var drawPriceDistChart = function() {
  priceDistData = google.visualization.arrayToDataTable(rawPriceDistData);
  priceDistChart.draw(priceDistData, priceDistOptions);
}

var processPriceDistData = function(data) {
  var exchanges = ['Exchanges'];
  var prices = [];
  var dataTable = []
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

}