GameEngine.ColourNodeRenderer = GameEngine.NodeRenderer.extend({
  _className: "GameEngine.ColourNodeRenderer",
  _programScripts: [["color-node.fsh", "simple-node.vsh"], ["color-node.fsh", "node.vsh"], ["color-node.fsh", "node-3d.vsh"]],
  _doesDraw: true,

  setupGL: function() {
    this._super();
    
    var gl = getGL();
    var programKeys = this._programKeys;
    for (var i = 0; i < programKeys.length; i ++) {
      var programKey = programKeys[i];
//    this._programKeys.forEach(function(programKey) {
      var program = this[programKey];
      gl.useProgram(program);
      program.colorLocation = gl.getUniformLocation(program, "color");
//    }.bind(this));
    }
  },
  
  render: function(colourNode) {
    // Get the variables we need
    var gl = getGL();
    var shouldRender3D = colourNode._shouldRender3D;
    var program = shouldRender3D ? this.program3D : this.program;
    gl.useProgram(program);
    
    // Setup the colour
    var color = colourNode.color;
    gl.uniform4f(program.colorLocation, color.r, color.g, color.b, color.a);
    
    this._super(colourNode);
  }
});
GameEngine.colourNodeRenderer = new GameEngine.ColourNodeRenderer();