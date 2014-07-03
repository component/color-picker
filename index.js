
/**
 * Module dependencies.
 */

var o = require('jquery')
  , Emitter = require('emitter')
  , autoscale = require('autoscale-canvas');

/**
 * Expose `ColorPicker`.
 */

module.exports = ColorPicker;

/**
 * RGB util.
 */

function rgb(r,g,b) {
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

/**
 * RGBA util.
 */

function rgba(r,g,b,a) {
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}

/**
 * Mouse position util.
 */

function localPos(e) {
  var offset = o(e.target).offset();
  return {
    x: e.pageX - offset.left,
    y: e.pageY - offset.top
  };
}

/**
 * Initialize a new `ColorPicker`.
 *
 * Emits:
 *
 *    - `change` with the given color object
 *
 * @api public
 */

function ColorPicker() {
  this._colorPos = {};
  this.el = o(require('./template'));
  this.main = this.el.find('.main').get(0);
  this.spectrum = this.el.find('.spectrum').get(0);
  this.hue(rgb(255, 0, 0));
  this.spectrumEvents();
  this.mainEvents();
  this.w = 180;
  this.h = 180;
  this.render();
}

/**
 * Mixin Emitter.
 */

Emitter(ColorPicker.prototype);

/**
 * Set width / height to `n`.
 *
 * @param {Number} n
 * @return {ColorPicker} for chaining
 * @api public
 */

ColorPicker.prototype.size = function(n){
  return this
    .width(n)
    .height(n);
};

/**
 * Set width to `n`.
 *
 * @param {Number} n
 * @return {ColorPicker} for chaining
 * @api public
 */

ColorPicker.prototype.width = function(n){
  this.w = n;
  this.render();
  return this;
};

/**
 * Set height to `n`.
 *
 * @param {Number} n
 * @return {ColorPicker} for chaining
 * @api public
 */

ColorPicker.prototype.height = function(n){
  this.h = n;
  this.render();
  return this;
};

/**
 * Spectrum related events.
 *
 * @api private
 */

ColorPicker.prototype.spectrumEvents = function(){
  var self = this
    , canvas = o(this.spectrum)
    , down;

  function update(e) {
    var offsetY = localPos(e).y;
    var color = self.hueAt(offsetY - 4);
    self.hue(color.toString());
    self.emit('change', color);
    self._huePos = offsetY;
    self.render();
  }

  canvas.mousedown(function(e){
    e.preventDefault();
    down = true;
    update(e);
  });

  canvas.mousemove(function(e){
    if (down) update(e);
  });

  canvas.mouseup(function(){
    down = false;
  });
};

/**
 * Hue / lightness events.
 *
 * @api private
 */

ColorPicker.prototype.mainEvents = function(){
  var self = this
    , canvas = o(this.main)
    , down;

  function update(e) {
    var color;
    self._colorPos = localPos(e);
    color = self.colorAt(self._colorPos.x, self._colorPos.y);
    self.color(color.toString());
    self.emit('change', color);

    self.render();
  }

  canvas.mousedown(function(e){
    e.preventDefault();
    down = true;
    update(e);
  });

  canvas.mousemove(function(e){
    if (down) update(e);
  });

  canvas.mouseup(function(){
    down = false;
  });
};

/**
 * Get the RGB color at `(x, y)`.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {Object}
 * @api private
 */

ColorPicker.prototype.colorAt = function(x, y){
  var data = this.main.getContext('2d').getImageData(x, y, 1, 1).data;
  return {
    r: data[0],
    g: data[1],
    b: data[2],
    toString: function(){
      return rgb(this.r, this.g, this.b);
    }
  };
};

/**
 * Get the RGB color from hue, saturation, and brightness `(h, s, v)`.
 * Adapted from http://www.easyrgb.com/math.html
 *
 * @param {Number} h
 * @param {Number} s
 * @param {Number} v
 * @return {Object}
 * @api private
 */

ColorPicker.prototype.hsv2rgb = function (h, s, v) {
  var r, g, b;
  if ( s == 0 ) {
    r = v * 255;
    g = v * 255;
    b = v * 255;
  } else {

    // h must be < 1
    var var_h = h * 6;
    if ( var_h == 6 ) {
      var_h = 0;
    }

    var var_i = Math.floor(var_h);
    var var_1 = v * ( 1 - s );
    var var_2 = v * ( 1 - s * ( var_h - var_i ) );
    var var_3 = v * ( 1 - s * ( 1 - ( var_h - var_i ) ) );

    if ( var_i == 0 ) {
      var_r = v;
      var_g = var_3;
      var_b = var_1;
    } else if ( var_i == 1 ) {
      var_r = var_2;
      var_g = v;
      var_b = var_1;
    } else if ( var_i == 2 ) {
      var_r = var_1;
      var_g = v;
      var_b = var_3
    } else if ( var_i == 3 ) {
      var_r = var_1;
      var_g = var_2;
      var_b = v;
    } else if ( var_i == 4 ) {
      var_r = var_3;
      var_g = var_1;
      var_b = v;
    } else {
      var_r = v;
      var_g = var_1;
      var_b = var_2
    }

    r = var_r * 255;
    g = var_g * 255;
    b = var_b * 255;
  }

  return {
    r: r,
    g: g,
    b: b,
    toString: function(){
      return rgb(this.r, this.g, this.b);
    }
  };
};

/**
 * Get the hue, saturation, and brightness from RGB `(r, g, b)`.
 *
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @return {Object}
 * @api private
 */

ColorPicker.prototype.rgb2hsv = function (r, g, b) {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  var min = Math.min( r, g, b );    //Min. value of RGB
  var max = Math.max( r, g, b );    //Max. value of RGB
  var deltaMax = max - min;             //Delta RGB value
  var v = max;
  var s, h;
  var deltaRed, deltaGreen, deltaBlue;

  if ( deltaMax == 0 ) {
    h = 0;                               //HSV results = 0 ÷ 1
    s = 0;
  } else {
    s = deltaMax / max;
    deltaRed = ( ( ( max - r ) / 6 ) + ( deltaMax / 2 ) ) / deltaMax;
    deltaGreen = ( ( ( max - g ) / 6 ) + ( deltaMax / 2 ) ) / deltaMax;
    deltaBlue = ( ( ( max - b ) / 6 ) + ( deltaMax / 2 ) ) / deltaMax;

    if      ( r == max ) h = deltaBlue - deltaGreen;
    else if ( g == max ) h = ( 1 / 3 ) + deltaRed - deltaBlue;
    else if ( b == max ) h = ( 2 / 3 ) + deltaGreen - deltaRed;

    if ( h < 0 ) h += 1;
    if ( h > 1 ) h -= 1;
  }

  return {
    h: h,
    s: s,
    v: v
  };
};

/**
 * Get the RGB value at `y`.
 *
 * @param {Type} name
 * @return {Type}
 * @api private
 */

ColorPicker.prototype.hueAt = function(y){
  var data = this.spectrum.getContext('2d').getImageData(0, y, 1, 1).data;
  return {
    r: data[0],
    g: data[1],
    b: data[2],
    toString: function(){
      return rgb(this.r, this.g, this.b);
    }
  };
};

/**
 * Get or set `color`.
 *
 * @param {String} color
 * @return {String|ColorPicker}
 * @api public
 */

ColorPicker.prototype.color = function(color){
  // TODO: should detect/support rgba() too
  if (0 == arguments.length) return this._color;
  this._color = color;
  if (typeof color === 'string' && color.indexOf('rgb(') === 0) {
    this._hue = color;
    var _rgb = color.slice(4, -1).split(',');
    var hsv = this.rgb2hsv(_rgb[0]*1, _rgb[1]*1, _rgb[2]*1);
    this._huePos = (1 - hsv.h) * this.h;
    this._colorPos = {
      x: Math.round(hsv.s * this.w),
      y: Math.round((1 - hsv.v) * this.w)
    };
    this.render();
  }
  return this;
};

/**
 * Get or set hue `color`.
 *
 * @param {String} color
 * @return {String|ColorPicker}
 * @api public
 */

ColorPicker.prototype.hue = function(color){
  // TODO: update pos
  if (0 == arguments.length) return this._hue;
  this._hue = color;
  return this;
};

/**
 * Render with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

ColorPicker.prototype.render = function(options){
  options = options || {};
  this.renderMain(options);
  this.renderSpectrum(options);
};

/**
 * Render spectrum.
 *
 * @api private
 */

ColorPicker.prototype.renderSpectrum = function(options){
  var el = this.el
    , canvas = this.spectrum
    , ctx = canvas.getContext('2d')
    , pos = this._huePos
    , w = this.w * .12
    , h = this.h;

  canvas.width = w;
  canvas.height = h;
  autoscale(canvas);

  var grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, rgb(255, 0, 0));
  grad.addColorStop(.15, rgb(255, 0, 255));
  grad.addColorStop(.33, rgb(0, 0, 255));
  grad.addColorStop(.49, rgb(0, 255, 255));
  grad.addColorStop(.67, rgb(0, 255, 0));
  grad.addColorStop(.84, rgb(255, 255, 0));
  grad.addColorStop(1, rgb(255, 0, 0));

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // pos
  if (!pos) return;
  ctx.fillStyle = rgba(0,0,0, .5);
  ctx.fillRect(0, pos, w, 1);
  ctx.fillStyle = rgba(255,255,255, .7);
  ctx.fillRect(0, pos + 1, w, 1);
};

/**
 * Render hue/luminosity canvas.
 *
 * @api private
 */

ColorPicker.prototype.renderMain = function(options){
  var el = this.el
    , canvas = this.main
    , ctx = canvas.getContext('2d')
    , w = this.w
    , h = this.h
    , x = (this._colorPos.x || w) + .5
    , y = (this._colorPos.y || 0) + .5;

  canvas.width = w;
  canvas.height = h;
  autoscale(canvas);

  var grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, rgb(255, 255, 255));
  grad.addColorStop(1, this._hue);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, rgba(255, 255, 255, 0));
  grad.addColorStop(1, rgba(0, 0, 0, 1));

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // pos
  var rad = 10;
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = 1;

  // outer dark
  ctx.strokeStyle = rgba(0,0,0,.5);
  ctx.arc(x, y, rad / 2, 0, Math.PI * 2, false);
  ctx.stroke();

  // outer light
  ctx.strokeStyle = rgba(255,255,255,.5);
  ctx.arc(x, y, rad / 2 - 1, 0, Math.PI * 2, false);
  ctx.stroke();

  ctx.beginPath();
  ctx.restore();
};
