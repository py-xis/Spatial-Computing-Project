var admin2 = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");


// var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Hyderabad'));
// var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Bangalore Urban'));
var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Pune'));


var windData = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR")
  .select(['u_component_of_wind_10m', 'v_component_of_wind_10m'])  // raw wind bands
  .filterDate('2010-01-15', '2024-12-31')
  .filterBounds(geometry);


var extractWind = function(image) {
  var date = image.date().format('YYYY-MM-dd');

  var stats = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry.geometry(),
    scale: 1000,
    maxPixels: 1e13
  });

  return ee.Feature(null, {
    'date': date,
    'u_component_of_wind_10m': stats.get('u_component_of_wind_10m'),
    'v_component_of_wind_10m': stats.get('v_component_of_wind_10m')
  });
};


var windTimeSeries = windData.map(extractWind);


print('Raw Wind Components:', windTimeSeries.limit(5));


Export.table.toDrive({
  collection: windTimeSeries,
  description: 'WindComponents_Pune',
  fileFormat: 'CSV'
});

// Export.table.toDrive({
//     collection: windTimeSeries,
//     description: 'WindComponents_BLR',
//     fileFormat: 'CSV'
//   });

//   Export.table.toDrive({
//     collection: windTimeSeries,
//     description: 'WindComponents_HYD',
//     fileFormat: 'CSV'
//   });