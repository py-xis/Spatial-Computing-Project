// Load administrative boundaries
var admin2 = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");

// Filter for Hyderabad region
// Change the name of the districts according to the region required
var hydRegion = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Hyderabad'));

// Load gap-filled LST image collection
var lstCollection = ee.ImageCollection('projects/sat-io/open-datasets/gap-filled-lst/gf_day_1km');

// Function to convert b1 to Celsius and extract mean LST
var imageToFeature = function(image) {
  var lstCelsius = image.select('b1')
                        .rename('LST_Celsius');

  // Reduce over the entire region
  var meanLST = lstCelsius.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: hydRegion.geometry(),
    scale: 1000,
    maxPixels: 1e13
  }).get('LST_Celsius');

  // Return a feature with date and mean LST
  return ee.Feature(null, {
    'date': image.date().format('YYYY-MM-dd'),
    'LST_Celsius': meanLST
  });
};

// Map the function over the collection
var lstTimeSeries = lstCollection.map(imageToFeature);


// Export to CSV
Export.table.toDrive({
  collection: lstTimeSeries,
  description: 'LST_Daily_HYD_GF',
  fileFormat: 'CSV'
});