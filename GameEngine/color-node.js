GameEngine.ColorNode = GameEngine.Node.extend({
  _className: "GameEngine.ColorNode",

  /**
   *  @property {Dictionary} color
   *  @description The colour of the node
   */
   color: {r: 144.0 / 255.0, g: 19.0 / 255.0, b: 254.0 / 255.0, a: 1.0},
  
  init: function(contentSize, color, loadCallback) {
    this._super(contentSize);
    
    if (color) {
      this.color = color;
    }
  
    this._global.colorNode = {};
    this._doesDraw = true;
    this._renderer = GameEngine.colourNodeRenderer;
  },
  
  /* CANVAS METHODS */
  
  renderForCanvas: function() {
    var canvas = getCanvas();
    var context = canvas.getContext('2d');
    
    var position = this.getPosition();
    var contentSize = this.getContentSize();
    var scale = this._scale;
    var anchorPoint = this._anchorPoint;
    
    contentSize.width *= scale;
    contentSize.height *= scale;
    
//    position.x -= contentSize.width * anchorPoint.x;
//    position.y -= contentSize.height * anchorPoint.y;
    
    // Flip the position, jay
    position.y = 768.0 - position.y;
    
    var angleInRadians = this._rotation * Math.PI / 180;
    
    // Store the current transformation matrix
    context.save();
    
    context.translate(position.x, position.y);
    context.rotate(angleInRadians);
    context.globalAlpha = this._alpha;
    var color = this.color;
    context.fillStyle = "rgba(" + color.r * 255.0 + ", " + color.g * 255.0 + ", " + color.b * 255.0 + ", " + color.a + ")";
    context.fillRect(- contentSize.width * anchorPoint.x, - contentSize.height * anchorPoint.y, contentSize.width, contentSize.height);
    context.rotate(- angleInRadians);
    context.translate(- position.x, - position.y);
    
    // Restore the transform
    context.restore();
  }
 });