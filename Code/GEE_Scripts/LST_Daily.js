var admin2 = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");

// var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Pune'));
// var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Bangalore Urban'));
var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Hyderabad'));


var modisLandTemp = ee.ImageCollection("MODIS/061/MYD11A1")
  .select('LST_Day_1km')
  .filterDate('2010-01-15', '2024-12-31')
  .filterBounds(geometry);

var modisLandTemp = modisLandTemp.map(function(image){
  return image.multiply(0.02).copyProperties(image,['system:time_start']);
}); 


var extractTemperature = function(image) {
  var date = image.date().format('YYYY-MM-dd');
  var temperature = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 1000,
    maxPixels: 1e13
  }).get('LST_Day_1km');
  return ee.Feature(null,{'date': date, 'temperature': temperature});
};

var temperatureTimeSeries = modisLandTemp.map(extractTemperature);


print(temperatureTimeSeries.limit(5));

// Export.table.toDrive({
//     collection: temperatureTimeSeries,
//     description: 'MYD11A1_Pune',
//     fileFormat: 'CSV'
//   });

// Export.table.toDrive({
// collection: temperatureTimeSeries,
// description: 'MYD11A1_BLR',
// fileFormat: 'CSV'
// });

Export.table.toDrive({
  collection: temperatureTimeSeries,
  description: 'MYD11A1_HYD',
  fileFormat: 'CSV'
});

