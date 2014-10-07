 angular.module('pulse.services', ['cmm.sockets'])
 .factory('MarketData', ['PriceData', 'PriceDistData', 'COVData', 'VolumeData', 'RangeData', 'SummaryData', 
  function (PriceData, PriceDistData, COVData, VolumeData, RangeData, SummaryData) {
 
    return {
      price: PriceData,
      priceDist: PriceDistData,
      cov: COVData,
      volume: VolumeData,
      range: RangeData,
      summary: SummaryData
    };
 }]);