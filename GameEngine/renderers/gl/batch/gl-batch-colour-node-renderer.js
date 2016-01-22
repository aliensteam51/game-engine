GameEngine.GLBatchColourNodeRenderer = GameEngine.GLBatchNodeRenderer.extend({
  _className: "GameEngine.GLBatchColourNodeRenderer",
  _programScripts: [["batch-color-node.fsh", "simple-batch-node.vsh"], ["batch-color-node.fsh", "batch-node.vsh"], ["batch-color-node.fsh", "batch-node-3d.vsh"]],
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