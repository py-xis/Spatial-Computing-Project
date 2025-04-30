var admin2 = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");


// var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Pune'));
// var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Bangalore Urban'));
var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Hyderabad'));


var ERA5_DewPoints = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR")
  .select('dewpoint_temperature_2m')
  .filterDate('2010-01-15', '2024-12-31') 
  .filterBounds(geometry);


var extractDewPoints = function(image) {
  var date = image.date().format('YYYY-MM-dd');
  var dewPointTemp = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 1000,
    maxPixels: 1e13
  }).get('dewpoint_temperature_2m');
  return ee.Feature(null,{'date': date, 'dewPointTemp': dewPointTemp});
};

var dewPointSeries = ERA5_DewPoints.map(extractDewPoints);

print(dewPointSeries.limit(5));

Export.table.toDrive({
  collection: dewPointSeries,
  description: 'DPT_HYD',
  fileFormat: 'CSV'
});

// Export.table.toDrive({
//     collection: dewPointSeries,
//     description: 'DPT_BLR',
//     fileFormat: 'CSV'
//   });

//   Export.table.toDrive({
//     collection: dewPointSeries,
//     description: 'DPT_Pune',
//     fileFormat: 'CSV'
//   });