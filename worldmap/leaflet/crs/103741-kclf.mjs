import * as spatial from './spatial.mjs'

export const crs = {
  "name": "NAD 1983 HARN Adj. Minnesota Kandiyohi Feet [landfill]",
  "source": "ESRI:103741:kclf",
  "proj4": "+proj=lcc +lat_0=44.8913888888889 +lon_0=-94.75 +lat_1=44.9666666666667 +lat_2=45.3333333333333 +x_0=152400.30480061 +y_0=30480.0609601219 +a=6378498.189 +rf=298.257222100883 +units=us-ft +no_defs",
  "srid": 103741,
  "full_source": "urn:ogc:def:crs:ESRI::103741",
  "units": "us-ft",
  "bounds": {
    "crs": "epsg:4326",
    "xmin": -95.020853,
    "xmax": -95.007765,
    "ymin": 45.268745,
    "ymax": 45.283815
  },
  "matrix": {
    "name": "Landfill Coordinates",
    "translations": [
      {
        "translate": [
          -433244.9375,
          -242642.375
        ]
      },
      {
        "rotateDeg": 0.21
      },
      {
        "translate": [
          5000.0,
          5000.0
        ]
      }
    ]
  }
}

export const fromLatLng = (latlng, { fromCrs } = { fromCrs: null }) => {
  // console.log('crs.matrix.translations', crs.matrix.translations)
  return spatial.convertGeometry({
    toCrs: crs,
    isYX: true,
    geometry: [latlng.lat, latlng.lng],
    fromCrs
  })
}
