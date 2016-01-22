/**
 *
 * @class ColourNode
 * @description The colour node shows a coloured rectangle on screen
 * @module GameEngine.ColourNode
 */
GameEngine.ColourNode = GameEngine.Node.extend({
  _className: "GameEngine.ColourNode",

  /**
   *  @property {Dictionary} colour
   *  @description The colour of the node
   */
  _colour: {r: 144.0 / 255.0, g: 19.0 / 255.0, b: 254.0 / 255.0, a: 1.0},
  
  /**
   *  @method init
   *  @description Creates a new colour node object
   *  @param contentSize {Dictionary} The size of the new colour node
   *  @param colour {Dictionary} The colour of the new colour node
   *
   *  @example var colourNode = new GameEngine.ColourNode({width: 100.0, height: 100.0}, {r: 1.0, g: 0.0, b: 0.0, a: 1.0})
   */
  init: function(contentSize, colour) {
    this._super(contentSize);
    
    if (color) {
      this._colour = colour;
    }
  
    this._global.colorNode = {};
    this._doesDraw = true;
    this._renderer = GameEngine.colourNodeRenderer;
  },
  
  /**
   *  @method setColour
   *  @description Sets the colour nodes colour
   *  @param colour {Dictionary} The new colour to set
   *
   *  @example colourNode.setColour({r: 0.8, g: 0.0, b: 0.8, a: 1.0})
   */
  setColour: function(colour) {
    this._colour = colour;
    
    this._update();
  },
   
  /**
   * @method getColour
   * @description Gets the colour of the colour node
   * @return Returns the current colour nodes colour
   *
   * @example var usedColour = colourNode.getColour()
   */
  getColour: function() {
    return this._colour;
  },
  
  render: function() {
    GameEngine.colourNodeRenderer.render(this);
//    this._renderer.render(this);
  },
  
  // TEMPORARY, will be moved to its own class
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
    var colour = this._colour;
    context.fillStyle = "rgba(" + colour.r * 255.0 + ", " + colour.g * 255.0 + ", " + colour.b * 255.0 + ", " + colour.a + ")";
    context.fillRect(- contentSize.width * anchorPoint.x, - contentSize.height * anchorPoint.y, contentSize.width, contentSize.height);
    context.rotate(- angleInRadians);
    context.translate(- position.x, - position.y);
    
    // Restore the transform
    context.restore();
  }
 });