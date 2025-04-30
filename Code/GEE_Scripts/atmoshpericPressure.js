var admin2 = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");

var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Pune'));
// var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Bangalore Urban'));
// var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Hyderabad'));


var ERA5_AP = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR")
  .select('surface_pressure')
  .filterDate('2010-01-15', '2024-12-31')
  .filterBounds(geometry);


var extractAP = function(image) {
  var date = image.date().format('YYYY-MM-dd');
  var surfacePressure = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 1000,
    maxPixels: 1e13
  }).get('surface_pressure');
  return ee.Feature(null,{'date': date, 'surfacePressure': surfacePressure});
};


var APSeries = ERA5_AP.map(extractAP);


print(APSeries.limit(5));

Export.table.toDrive({
  collection: APSeries,
  description: 'AP_Pune',
  fileFormat: 'CSV'
});

// Export.table.toDrive({
//     collection: APSeries,
//     description: 'AP_BLR',
//     fileFormat: 'CSV'
//   });

// Export.table.toDrive({
// collection: APSeries,
// description: 'AP_HYD',
// fileFormat: 'CSV'
// });