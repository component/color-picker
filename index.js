
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
  var x = typeof( e.offsetX ) != 'undefined' ? e.offsetX : ( e.pageX - offset.left );
  var y = typeof( e.offsetY ) != 'undefined' ? e.offsetY : ( e.pageY - offset.top );
  return {
    x: x,
    y: y
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

  var gradientBuffer = document.createElement('canvas');
  gradientBuffer.width = this.w;
  gradientBuffer.height = this.h;
  var ctx = gradientBuffer.getContext('2d');
  var gradient = this.spectrumGradient = ctx.createLinearGradient(0, 0, 0, this.h);
  gradient.addColorStop(0, rgb(255, 0, 0));
  gradient.addColorStop(.15, rgb(255, 0, 255));
  gradient.addColorStop(.33, rgb(0, 0, 255));
  gradient.addColorStop(.49, rgb(0, 255, 255));
  gradient.addColorStop(.67, rgb(0, 255, 0));
  gradient.addColorStop(.84, rgb(255, 255, 0));
  gradient.addColorStop(1, rgb(255, 0, 0));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, this.w, this.h);
  this.gradientBuffer = gradientBuffer;
  
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
    , down
    , target; // denotes we are the current target, without this, when mouse moves/enters/leaves it can start interacting with the other element

  function update(e) {
    var offsetY = localPos(e).y;
    var color = self.hueAt(offsetY);
    self.hue(color.toString());
    self.emit('change', color);
    self._huePos = offsetY;
    self.render();
  }

  canvas.mousedown(function(e){
    e.preventDefault();
    down = true;
    target = true;
    update(e);
  });

  canvas.mousemove(function(e){
    if (target && down) update(e);
  });

  canvas.mouseup(function(){
    down = false;
    target = false;
  });

  canvas.mouseenter(function(e){
    down = !!e.which; // e.which is 1 if the mouse button is down when entering
    if ( !down )
    {
        target = false;
    }
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
    , down
    , target; // denotes we are the current target, without this, when mouse moves/enters/leaves it can start interacting with the other element

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
    target = true;
    update(e);
  });

  canvas.mousemove(function(e){
    if (target && down) update(e);
  });

  canvas.mouseup(function(){
    down = false;
    target = false;
  });

  canvas.mouseenter(function(e){
    down = !!e.which; // e.which is 1 if the mouse button is down when entering
    if ( !down )
    {
        target = false;
    }
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
 * Get the RGB value at `y`.
 *
 * @param {Type} name
 * @return {Type}
 * @api private
 */

ColorPicker.prototype.hueAt = function(y){
  var data = this.gradientBuffer.getContext('2d').getImageData(0, Math.min( Math.max( 0, y ), this.spectrum.height - 1 ), 1, 1).data;
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
  // TODO: update pos
  // TODO: should update .hue() automatically...
  if (0 == arguments.length) return this._color;
  this._color = color;
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

  ctx.drawImage( this.gradientBuffer, 0, 0 );

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