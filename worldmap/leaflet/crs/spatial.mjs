import { Matrix } from './transformation-matrix-js.js'

const isArray = (n) => Array.isArray(n)
const isNumber = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n)
}
const isString = (str) => {
  return typeof str === 'string'
}
export const proj4DefaultWgs =
  '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'
export const bboxCompare = (p, bbox) => {
  if (bbox[0] > p[0]) {
    bbox[0] = p[0]
  }
  if (bbox[1] > p[1]) {
    bbox[1] = p[1]
  }
  if (bbox[2] < p[0]) {
    bbox[2] = p[0]
  }
  if (bbox[3] < p[1]) {
    bbox[3] = p[1]
  }
  return bbox
}
export const bbox = (coords) => {
  let result = [Infinity, Infinity, -Infinity, -Infinity]
  for (const c of coords) {
    if (isArray(c) && !isNumber(c[0])) {
      for (const l of c) {
        if (isArray(l) && !isNumber(l[0])) {
          for (const p of l) {
            result = bboxCompare(p, result)
          }
        } else {
          // line
          result = bboxCompare(l, result)
        }
      }
    } else {
      // point
      result = bboxCompare(c, result)
    }
  }
  return result.every((n) => isFinite(n)) ? result : null
}
export const geometryToBounds = ({ geometry, isYX }) => {
  let bbox = bbox(geometry)
  let bounds
  if (bbox) {
    let [min_v1, min_v2, max_v1, max_v2] = bbox
    bounds = isYX
      ? { ymin: min_v1, xmin: min_v2, ymax: max_v1, xmax: max_v2 }
      : { ymin: min_v2, xmin: min_v1, ymax: max_v2, xmax: max_v1 }
  }
  return bounds
}
export const constructMatrices = (translations) => {
  return translations.map((translation) => {
    return Object.keys(translation).reduce((matrix, method) => {
      let data = translation[method]
      if (data === null || data === undefined) return matrix
      if (isNumber(data) && data === 0) return matrix
      if (Array.isArray(data) && data.length === 0) return matrix
      if (isString(data) && data.length === 0) return matrix
      translation[method] instanceof Array
        ? matrix[method](...data)
        : matrix[method](data)
      return matrix
    }, new Matrix())
  })
}
export function convertGeometry({
  isYX,
  toCrs,
  fromCrs,
  geometry,
  isLatLng,
  getBounds,
}) {
  let toResult = geometry
  const latLngConvert = (g) =>
    isYX
      ? { lat: toResult[0], lng: toResult[1] }
      : { lat: toResult[1], lng: toResult[0] }
  if (isLatLng)
    toResult = isYX
      ? [geometry.lat, geoemtry.lng]
      : [geometry.lng, geometry.lat]
  if (fromCrs?.matrix?.translations) {
    let { translations } = fromCrs.matrix
    toResult = translateInverse({
      translations,
      geometry: toResult,
      isYX,
    })
  }
  toResult = transformForward({
    geometry: toResult,
    fromCrs,
    toCrs,
    isYX,
  })
  if (toCrs?.matrix?.translations) {
    let { translations } = toCrs.matrix
    toResult = translateForward({
      translations,
      geometry: toResult,
      isYX,
    })
  }
  if (getBounds) {
    return {
      geometry: isLatLng ? latLngConvert(toResult) : toResult,
      bounds: geometryToBounds({ geometry: toResult, isYX }),
    }
  }
  return isLatLng ? latLngConvert(toResult) : toResult
}
function applyGeometryTransform({ fromCrs, toCrs, geometry, fn, isYX }) {
  let result
  if (isArray(geometry) && !isNumber(geometry[0])) {
    result = geometry.map((c) => {
      return isArray(c) && !isNumber(c[0])
        ? c.map((cSub) => fn({ fromCrs, toCrs, coordinate: cSub, isYX }))
        : fn({ fromCrs, toCrs, coordinate: c, isYX })
    })
  } else {
    result = fn({ fromCrs, toCrs, coordinate: geometry, isYX })
  }
  return result
}
function convertCoordinateForward({ fromCrs, toCrs, coordinate, isYX }) {
  toCrs = toCrs?.proj4 || proj4DefaultWgs
  fromCrs = fromCrs?.proj4 || proj4DefaultWgs
  let result
  if (isYX)
    result = proj4(fromCrs, toCrs)
      .forward([...coordinate].reverse())
      .reverse()
  else result = proj4(fromCrs, toCrs).forward(coordinate)
  return result
}
function convertCoordinateInverse({ fromCrs, toCrs, coordinate, isYX }) {
  toCrs = toCrs?.proj4 || proj4DefaultWgs
  fromCrs = fromCrs?.proj4 || proj4DefaultWgs
  let result
  if (isYX)
    result = proj4(fromCrs, toCrs)
      .inverse([...coordinate].reverse())
      .reverse()
  else result = proj4(fromCrs, toCrs).inverse(coordinate)
  return result
}
function transformForward({ fromCrs, toCrs, geometry, isYX }) {
  let result = applyGeometryTransform({
    fromCrs,
    toCrs,
    geometry,
    fn: convertCoordinateForward,
    isYX,
  })
  return result
}
function transformInverse({ fromCrs, toCrs, geometry, isYX }) {
  let result = applyGeometryTransform({
    fromCrs,
    toCrs,
    geometry,
    fn: convertCoordinateInverse,
    isYX,
  })
  return result
}
function applyGeometryTranslate({ geometry, fn, matrices, isYX }) {
  let result
  if (isArray(geometry) && !isNumber(geometry[0])) {
    result = geometry.map((c) => {
      return isArray(c) && !isNumber(c[0])
        ? c.map((cSub) => fn({ coordinate: cSub, matrices }))
        : fn({ coordinate: c, matrices })
    })
  } else {
    result = fn({ coordinate: geometry, matrices })
  }
  return result
}
function translateForward({ translations, geometry, isYX }) {
  let matrices = constructMatrices(translations)
  let fn = ({ coordinate, matrices }) => {
    let result
    if (isYX)
      result = forward([...coordinate].reverse(), matrices).reverse()
    else result = forward(coordinate, matrices)
    return result
  }
  let result = applyGeometryTranslate({ geometry, fn, matrices })
  return result
}
function translateInverse({ translations, geometry, isYX }) {
  let matrices = constructMatrices(translations)
  let fn = ({ coordinate, matrices }) => {
    let result
    if (isYX)
      result = invert([...coordinate].reverse(), matrices).reverse()
    else result = invert(coordinate, matrices)
    return result
  }
  let result = applyGeometryTranslate({ geometry, fn, matrices })
  return result
}
export const forward = (coord, matrices) => {
  return matrices.reduce(([x, y], matrix) => {
    let c = pointTranslation(x, y, matrix)
    return c
  }, coord)
}
export const reverseMatrices = (matrices) => {
  return matrices
    .slice()
    .reverse()
    .map((t) => t.inverse())
}
export const invert = (coord, matrices) => {
  let inverted = reverseMatrices(matrices)
  return inverted.reduce(([x, y], matrix) => {
    let c = pointTranslation(x, y, matrix)
    return c
  }, coord)
}
export const pointTranslation = (x, y, matrix) => {
  let p = matrix.applyToPoint(x, y)
  return [p.x, p.y]
}