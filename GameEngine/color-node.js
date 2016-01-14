GameEngine.ColorNode = GameEngine.Node.extend({
  _className: "GameEngine.ColorNode",

  /**
   *  @property {Dictionary} color
   *  @description The colour of the node
   */
   color: {r: 144.0 / 255.0, g: 19.0 / 255.0, b: 254.0 / 255.0, a: 1.0},

  /**
   *  @property {Boolean} loaded
   *  @description If the colour node is loaded or not
   */
  loaded: false,
  
  init: function(contentSize, color, loadCallback) {
    this.doesDraw = true;
  
    this._super(contentSize, loadCallback);
    
    if (color) {
      this.color = color;
    }
  },
  
  setup: function(contentSize, loadCallback) {
    this._super(contentSize, function() {
      this.loaded = true;
      
      if (loadCallback) {
        loadCallback();
      }
    }.bind(this));
  },
  
  setShadowEnabled: function(enabled) {
    //this._super(enabled);
  },
  
  /* CANVAS METHODS */
  
  renderForCanvas: function() {
    console.log("RENDER FOR CANVAS");
	
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
    
    if (this.isShadowEnabled) {
      context.shadowColor = "rgba( 0, 0, 0, 0.3 )";
      context.shadowOffsetX = 2.0;
      context.shadowOffsetY = 2.0;
      context.shadowBlur = 10.0;
    }
    
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
  },
  
  /* WEBGL METHODS */
  
  createProgram: function(completion) {
    var script1 = document.getElementById("color-node.fsh");
    var script2 = document.getElementById("node.vsh");
    var scripts = [script1, script2];
  
    // First load the shader scripts
    loadScripts(scripts, 0, function() {
      var gl = getGL();
      var program = createProgramFromScripts(gl, "node.fsh", "node.vsh");
      completion(program);
    });
  },
  
  setupGL: function(completion) {
    this._super(function(program) {
      var gl = getGL();
      gl.useProgram(program);
      
      program.colorLocation = gl.getUniformLocation(program, "color");
      
      if (completion) {
        completion();
      }
    });
  },
  
  rectangleArray: null,
  positionLocation: null,
  colorLocation: null,

  render: function() {
    if (!this.loaded) {
      return;
    }
    
    // Get the variables we need
    var gl = getGL();
    var program = this.program;
    gl.useProgram(program);
    
    // Setup the colour
    var color = this.color;
    gl.uniform4f(program.colorLocation, color.r, color.g, color.b, color.a);
    
    this._super();
  }
});