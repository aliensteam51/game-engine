GameEngine.ColorNode = GameEngine.Node.extend({
  _className: "GameEngine.ColorNode",

  /**
   *  @property {Dictionary} color
   *  @description The colour of the node
   */
   color: {r: 144.0 / 255.0, g: 19.0 / 255.0, b: 254.0 / 255.0, a: 1.0},

  /**
   *  @property {Boolean} _loaded
   *  @description If the colour node is loaded or not
   */
  _loaded: false,
  
  _global: {},
  
  init: function(contentSize, color, loadCallback) {
    this._global.colorNode = {};
    this._doesDraw = true;
  
    this._super(contentSize, loadCallback);
    
    if (color) {
      this.color = color;
    }
  },
  
  setup: function(contentSize, loadCallback) {
    this._super(contentSize, function() {
      this._loaded = true;
      
      if (loadCallback) {
        loadCallback();
      }
    }.bind(this));
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
  },
  
  /* WEBGL METHODS */
  
  createProgram: function(completion) {
    if (this._global.program) {
      completion(this._global.program)
      return;
    }
  
    var script1 = document.getElementById("color-node.fsh");
    var script2 = document.getElementById("node.vsh");
    var scripts = [script1, script2];
  
    // First load the shader scripts
    loadScripts(scripts, 0, function() {
      var gl = getGL();
      var program = createProgramFromScripts(gl, "color-node.fsh", "node.vsh");
      this._global.program = program
      completion(program);
    }.bind(this));
  },
  
  createProgram3D: function(completion) {
    if (this._global.program3D) {
      completion(this._global.program3D);
      return;
    }
  
    var script1 = document.getElementById("color-node.fsh");
    var script2 = document.getElementById("node-3d.vsh");
    var scripts = [script1, script2];
  
    // First load the shader scripts
    loadScripts(scripts, 0, function() {
      var gl = getGL();
      var program = createProgramFromScripts(gl, "color-node.fsh", "node-3d.vsh");
      this._global.program3D = program;
      completion(program);
    }.bind(this));
  },
  
  setupGL: function(completion) {
    this._super(function(programs) {
      var gl = getGL();
      programs.forEach(function(program) {
        gl.useProgram(program);
        program.colorLocation = gl.getUniformLocation(program, "color");
      });
      if (completion) {
        completion();
      }
    });
  },

  render: function() {
    if (!this._loaded) {
      return;
    }
    
    // Get the variables we need
    var gl = getGL();
    var shouldRender3D = this._shouldRender3D;
    var program = shouldRender3D ? this.program3D : this.program;
    gl.useProgram(program);
    
    console.log("rectangleArray", this.rectangleArray, this._contentSize);
    
    // Setup the colour
    var color = this.color;
    gl.uniform4f(program.colorLocation, color.r, color.g, color.b, color.a);
    
    this._super();
  }
});