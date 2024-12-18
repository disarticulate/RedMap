/*
	2D Transformation Matrix v2.7.2
	(c) Epistemex.com 2014-2017
	License: MIT, header required.
*/
export function Matrix(b, c) {
  var d = this,
    a
  d._t = d.transform
  d.a = d.d = 1
  d.b = d.c = d.e = d.f = 0
  if (b) {
    ;(d.context = b).setTransform(1, 0, 0, 1, 0, 0)
  }
  Object.defineProperty(d, 'element', {
    get: function () {
      return a
    },
    set: function (e) {
      if (!a) {
        d._px = d._getPX()
        d.useCSS3D = !1
      }
      a = e
      ;(d._st = a.style)[d._px] = d.toCSS()
    },
  })
  if (c) {
    d.element = c
  }
}
Matrix.fromTriangles = function (j, k, a) {
  var b = new Matrix(),
    c = new Matrix(a),
    d,
    e,
    f,
    h,
    g,
    i
  if (Array.isArray(j)) {
    if (typeof j[0] === 'number') {
      f = j[4]
      h = j[5]
      g = k[4]
      i = k[5]
      d = [j[0] - f, j[1] - h, j[2] - f, j[3] - h, f, h]
      e = [k[0] - g, k[1] - i, k[2] - g, k[3] - i, g, i]
    } else {
      f = j[2].x
      h = j[2].y
      g = k[2].x
      i = k[2].y
      d = [j[0].x - f, j[0].y - h, j[1].x - f, j[1].y - h, f, h]
      e = [k[0].x - g, k[0].y - i, k[1].x - g, k[1].y - i, g, i]
    }
  } else {
    d = [j.px - j.rx, j.py - j.ry, j.qx - j.rx, j.qy - j.ry, j.rx, j.ry]
    e = [k.px - k.rx, k.py - k.ry, k.qx - k.rx, k.qy - k.ry, k.rx, k.ry]
  }
  b.setTransform.apply(b, d)
  c.setTransform.apply(c, e)
  return c.multiply(b.inverse())
}
Matrix.fromSVGTransformList = function (e, a, b) {
  var d = new Matrix(a, b),
    c = 0
  while (c < e.length) {
    d.multiply(e[c++].matrix)
  }
  return d
}
Matrix.from = function (g, h, i, k, o, p, j, n) {
  var r = new Matrix(j, n),
    t,
    l,
    s
  if (typeof g === 'number') {
    r.setTransform(g, h, i, k, o, p)
  } else {
    if (typeof g.x === 'number') {
      s = Math.sqrt(g.x * g.x + g.y * g.y)
      t = l = 1
      if (k) {
        t = s
      } else {
        l = s
      }
      r.translate(h || 0, i || 0)
        .rotateFromVector(g)
        .scaleU(t)
        .translate(l, 0)
    } else {
      if (typeof g.is2D === 'boolean' && !g.is2D) {
        throw 'Cannot use 3D DOMMatrix.'
      }
      if (h) {
        r.context = h
      }
      if (i) {
        r.element = i
      }
      r.multiply(g)
    }
  }
  return r
}
Matrix.prototype = {
  _getPX: function () {
    var b = ['t', 'oT', 'msT', 'mozT', 'webkitT', 'khtmlT'],
      a = 0,
      c,
      d = document.createElement('div').style
    while ((c = b[a++])) {
      if (typeof d[c + 'ransform'] !== 'undefined') {
        return c + 'ransform'
      }
    }
  },
  concat: function (a) {
    return this.clone().multiply(a)
  },
  flipX: function () {
    return this._t(-1, 0, 0, 1, 0, 0)
  },
  flipY: function () {
    return this._t(1, 0, 0, -1, 0, 0)
  },
  reflectVector: function (c, e) {
    var b = this.applyToPoint(0, 1),
      a = (b.x * c + b.y * e) * 2
    c -= a * b.x
    e -= a * b.y
    return { x: c, y: e }
  },
  reset: function () {
    return this.setTransform(1, 0, 0, 1, 0, 0)
  },
  rotate: function (a) {
    var b = Math.cos(a),
      c = Math.sin(a)
    return this._t(b, c, -c, b, 0, 0)
  },
  rotateFromVector: function (a, b) {
    return this.rotate(
      typeof a === 'number' ? Math.atan2(b, a) : Math.atan2(a.y, a.x)
    )
  },
  rotateDeg: function (a) {
    return this.rotate((a * Math.PI) / 180)
  },
  scaleU: function (a) {
    return this._t(a, 0, 0, a, 0, 0)
  },
  scale: function (a, b) {
    return this._t(a, 0, 0, b, 0, 0)
  },
  scaleX: function (a) {
    return this._t(a, 0, 0, 1, 0, 0)
  },
  scaleY: function (a) {
    return this._t(1, 0, 0, a, 0, 0)
  },
  scaleFromVector: function (a, b) {
    return this.scaleU(Math.sqrt(a * a + b * b))
  },
  shear: function (a, b) {
    return this._t(1, b, a, 1, 0, 0)
  },
  shearX: function (a) {
    return this._t(1, 0, a, 1, 0, 0)
  },
  shearY: function (a) {
    return this._t(1, a, 0, 1, 0, 0)
  },
  skew: function (a, b) {
    return this.shear(Math.tan(a), Math.tan(b))
  },
  skewDeg: function (a, b) {
    return this.shear(
      Math.tan((a / 180) * Math.PI),
      Math.tan((b / 180) * Math.PI)
    )
  },
  skewX: function (a) {
    return this.shearX(Math.tan(a))
  },
  skewY: function (a) {
    return this.shearY(Math.tan(a))
  },
  setTransform: function (g, h, i, j, k, l) {
    var m = this
    m.a = g
    m.b = h
    m.c = i
    m.d = j
    m.e = k
    m.f = l
    return m._x()
  },
  translate: function (a, b) {
    return this._t(1, 0, 0, 1, a, b)
  },
  translateX: function (a) {
    return this._t(1, 0, 0, 1, a, 0)
  },
  translateY: function (a) {
    return this._t(1, 0, 0, 1, 0, a)
  },
  transform: function (b, d, f, h, j, l) {
    var m = this,
      a = m.a,
      c = m.b,
      e = m.c,
      g = m.d,
      i = m.e,
      k = m.f
    m.a = a * b + e * d
    m.b = c * b + g * d
    m.c = a * f + e * h
    m.d = c * f + g * h
    m.e = a * j + e * l + i
    m.f = c * j + g * l + k
    return m._x()
  },
  multiply: function (a) {
    return this._t(a.a, a.b, a.c, a.d, a.e, a.f)
  },
  divide: function (a) {
    return this.multiply(a.inverse())
  },
  divideScalar: function (a) {
    var b = this
    if (!a) {
      throw 'Division on zero'
    }
    b.a /= a
    b.b /= a
    b.c /= a
    b.d /= a
    b.e /= a
    b.f /= a
    return b._x()
  },
  inverse: function (a, b) {
    var e = this,
      d = new Matrix(a ? e.context : null, b ? e.element : null),
      c = e.determinant()
    if (e._q(c, 0)) {
      throw 'Matrix not invertible.'
    }
    d.a = e.d / c
    d.b = -e.b / c
    d.c = -e.c / c
    d.d = e.a / c
    d.e = (e.c * e.f - e.d * e.e) / c
    d.f = -(e.a * e.f - e.b * e.e) / c
    return d
  },
  interpolate: function (d, f, a, b) {
    var e = this,
      c = new Matrix(a, b)
    c.a = e.a + (d.a - e.a) * f
    c.b = e.b + (d.b - e.b) * f
    c.c = e.c + (d.c - e.c) * f
    c.d = e.d + (d.d - e.d) * f
    c.e = e.e + (d.e - e.e) * f
    c.f = e.f + (d.f - e.f) * f
    return c._x()
  },
  interpolateAnim: function (f, h, a, d) {
    var e = new Matrix(a, d),
      b = this.decompose(),
      c = f.decompose(),
      i = b.translate,
      j = c.translate,
      g = b.scale
    e.translate(i.x + (j.x - i.x) * h, i.y + (j.y - i.y) * h)
    e.rotate(b.rotation + (c.rotation - b.rotation) * h)
    e.scale(g.x + (c.scale.x - g.x) * h, g.y + (c.scale.y - g.y) * h)
    return e._x()
  },
  decompose: function (w) {
    var l = this,
      e = l.a,
      h = l.b,
      i = l.c,
      j = l.d,
      f = Math.acos,
      g = Math.atan,
      u = Math.sqrt,
      m = Math.PI,
      v = { x: l.e, y: l.f },
      o = 0,
      q = { x: 1, y: 1 },
      t = { x: 0, y: 0 },
      k = e * j - h * i
    if (w) {
      if (e) {
        t = { x: g(i / e), y: g(h / e) }
        q = { x: e, y: k / e }
      } else {
        if (h) {
          o = m * 0.5
          q = { x: h, y: k / h }
          t.x = g(j / h)
        } else {
          q = { x: i, y: j }
          t.x = m * 0.25
        }
      }
    } else {
      if (e || h) {
        var n = u(e * e + h * h)
        o = h > 0 ? f(e / n) : -f(e / n)
        q = { x: n, y: k / n }
        t.x = g((e * i + h * j) / (n * n))
      } else {
        if (i || j) {
          var p = u(i * i + j * j)
          o = m * 0.5 - (j > 0 ? f(-i / p) : -f(i / p))
          q = { x: k / p, y: p }
          t.y = g((e * i + h * j) / (p * p))
        } else {
          q = { x: 0, y: 0 }
        }
      }
    }
    return { translate: v, rotation: o, scale: q, skew: t }
  },
  determinant: function () {
    return this.a * this.d - this.b * this.c
  },
  applyToPoint: function (b, c) {
    var a = this
    return { x: b * a.a + c * a.c + a.e, y: b * a.b + c * a.d + a.f }
  },
  applyToArray: function (e) {
    var a = 0,
      d,
      b,
      c = []
    if (typeof e[0] === 'number') {
      b = e.length
      while (a < b) {
        d = this.applyToPoint(e[a++], e[a++])
        c.push(d.x, d.y)
      }
    } else {
      while ((d = e[a++])) {
        c.push(this.applyToPoint(d.x, d.y))
      }
    }
    return c
  },
  applyToTypedArray: function (e, f) {
    var a = 0,
      d,
      b = e.length,
      c = f ? new Float64Array(b) : new Float32Array(b)
    while (a < b) {
      d = this.applyToPoint(e[a], e[a + 1])
      c[a++] = d.x
      c[a++] = d.y
    }
    return c
  },
  applyToContext: function (a) {
    var b = this
    a.setTransform(b.a, b.b, b.c, b.d, b.e, b.f)
    return b
  },
  applyToElement: function (a, c) {
    var b = this
    if (!b._px) {
      b._px = b._getPX()
    }
    a.style[b._px] = c ? b.toCSS3D() : b.toCSS()
    return b
  },
  applyToObject: function (b) {
    var a = this
    b.a = a.a
    b.b = a.b
    b.c = a.c
    b.d = a.d
    b.e = a.e
    b.f = a.f
    return a
  },
  isIdentity: function () {
    var a = this
    return (
      a._q(a.a, 1) &&
      a._q(a.b, 0) &&
      a._q(a.c, 0) &&
      a._q(a.d, 1) &&
      a._q(a.e, 0) &&
      a._q(a.f, 0)
    )
  },
  isInvertible: function () {
    return !this._q(this.determinant(), 0)
  },
  isValid: function () {
    return !(this.a * this.d)
  },
  isEqual: function (a) {
    var b = this,
      c = b._q
    return (
      c(b.a, a.a) &&
      c(b.b, a.b) &&
      c(b.c, a.c) &&
      c(b.d, a.d) &&
      c(b.e, a.e) &&
      c(b.f, a.f)
    )
  },
  clone: function (a) {
    return new Matrix(a ? null : this.context).multiply(this)
  },
  toArray: function () {
    var a = this
    return [a.a, a.b, a.c, a.d, a.e, a.f]
  },
  toTypedArray: function (d) {
    var b = d ? new Float64Array(6) : new Float32Array(6),
      c = this
    b[0] = c.a
    b[1] = c.b
    b[2] = c.c
    b[3] = c.d
    b[4] = c.e
    b[5] = c.f
    return b
  },
  toCSS: function () {
    return 'matrix(' + this.toArray() + ')'
  },
  toCSS3D: function () {
    var a = this
    return (
      'matrix3d(' +
      a.a +
      ',' +
      a.b +
      ',0,0,' +
      a.c +
      ',' +
      a.d +
      ',0,0,0,0,1,0,' +
      a.e +
      ',' +
      a.f +
      ',0,1)'
    )
  },
  toJSON: function () {
    var a = this
    return (
      '{"a":' +
      a.a +
      ',"b":' +
      a.b +
      ',"c":' +
      a.c +
      ',"d":' +
      a.d +
      ',"e":' +
      a.e +
      ',"f":' +
      a.f +
      '}'
    )
  },
  toString: function (a) {
    var b = this
    a = a || 4
    return (
      'a=' +
      b.a.toFixed(a) +
      ' b=' +
      b.b.toFixed(a) +
      ' c=' +
      b.c.toFixed(a) +
      ' d=' +
      b.d.toFixed(a) +
      ' e=' +
      b.e.toFixed(a) +
      ' f=' +
      b.f.toFixed(a)
    )
  },
  toCSV: function () {
    return this.toArray().join() + '\r\n'
  },
  toDOMMatrix: function () {
    var a = null
    if ('DOMMatrix' in window) {
      a = new DOMMatrix()
      a.a = this.a
      a.b = this.b
      a.c = this.c
      a.d = this.d
      a.e = this.e
      a.f = this.f
    }
    return a
  },
  toSVGMatrix: function () {
    var a = this,
      b = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      c = null
    if (b) {
      c = b.createSVGMatrix()
      c.a = a.a
      c.b = a.b
      c.c = a.c
      c.d = a.d
      c.e = a.e
      c.f = a.f
    }
    return c
  },
  _q: function (a, b) {
    return Math.abs(a - b) < 1e-14
  },
  _x: function () {
    var a = this
    if (a.context) {
      a.context.setTransform(a.a, a.b, a.c, a.d, a.e, a.f)
    }
    if (a._st) {
      a._st[a._px] = a.useCSS3D ? a.toCSS3D() : a.toCSS()
    }
    return a
  },
}
if (typeof exports !== 'undefined') {
}
