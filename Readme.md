
# ColorPicker

  Simple color picker component. Chuck it on a page, in
  a [Dialog](http://github.com/component/dialog), in
  a [Popover](http://github.com/component/popover) etc.

  ![js color picker component](http://f.cl.ly/items/1y3c0s2N2N1c2T292l2b/Screen%20Shot%202012-09-06%20at%206.33.07%20PM.png)

## Installation

    $ component install component/color-picker

## Example

```js
var ColorPicker = require('color-picker');

var picker = new ColorPicker;
picker.el.appendTo('body');
picker.on('change', function(color){
  $('.rgb').text(color.toString()).css('background', color);
});
```

## Events

  - `change` (color) when the color selection changes

## API

### ColorPicker#size(n)

  Define the color picker width / height.

### ColorPicker#width(n)

  Define the color picker width.

### ColorPicker#height(n)

  Define the color picker height.

### ColorPicker#color()

  Get the current selected color object with `.r`, `.g`, and `.b`
  values. The `.toString()` method on these color objects is the
  string representation such as "rgb(255,0,0)".

### ColorPicker#color(str)

  Set the color value to `str`.

## License

  MIT
