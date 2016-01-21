GameEngine.NodeRenderer = GameEngine.Renderer.extend({
  _className: "GameEngine.NodeRenderer",
  _programScripts: [["node.fsh", "simple-node.vsh"], ["node.fsh", "node.vsh"], ["node.fsh", "node-3d.vsh"]],
  _programKeys: ["simpleProgram", "program", "program3D"],
  _doesDraw: false,
  
  setupGL: function() {
    var gl = getGL();
    var programKeys = this._programKeys;
    for (var i = 0; i < programKeys.length; i ++) {
      var programKey = programKeys[i];
//    this._programKeys.forEach(function(programKey) {
      var program = this[programKey];
      
      if (programKey === "simpleProgram") {
        program.translationLocation = gl.getUniformLocation(program, "u_translation");
        program.rotationLocation = gl.getUniformLocation(program, "u_rotation");
        program.scaleLocation = gl.getUniformLocation(program, "u_scale");
      }
      else {
        program.matrixLocation = gl.getUniformLocation(program, "u_matrix");
      }
        
      program.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      program.positionLocation = gl.getAttribLocation(program, "a_position");
      
      if (this._doesDraw) {
        program.alphaLocation = gl.getUniformLocation(program, "tAlpha");
      
        // Set the alpha mode and enable blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
      
      gl.useProgram(program);
      
      var canvas = getCanvas();
      if (programKey === "program3D") {
        gl.uniform3f(program.resolutionLocation, canvas.width, canvas.height, canvas.width);
      }
      else {
        gl.uniform2f(program.resolutionLocation, canvas.width, canvas.height);
      }
      
      program.buffer = gl.createBuffer();
//    }.bind(this));
    }
  },
  
   render: function(node) {
    if (this._doesDraw) {
      var gl = getGL();
      
      var parent = node._parent;
      if (parent && parent._clipsToBounds) {
        gl.enable( gl.DEPTH_TEST );
        gl.enable(gl.STENCIL_TEST);
        
        parent._renderer.stencil(parent);
      }
      
      var shouldRender3D = node._shouldRender3D;
      var program = shouldRender3D ? this.program3D : this.program;
      gl.useProgram(program);
      
      // look up where the vertex data needs to go.
      var positionLocation = program.positionLocation;
      gl.bindBuffer(gl.ARRAY_BUFFER, program.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, node.rectangleArray, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, shouldRender3D ? 3 : 2, gl.FLOAT, false, 0, 0);
      
      gl.uniform1f(program.alphaLocation, node._alpha);
      
      if (node._shouldRender3D) {
        gl.uniformMatrix4fv(program.matrixLocation, false, node._matrix);
      }
      else {
        gl.uniformMatrix3fv(program.matrixLocation, false, node._matrix);
      }
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      if (parent && parent._clipsToBounds) {
        gl.disable( gl.DEPTH_TEST );
        gl.disable(gl.STENCIL_TEST);
      }
    }
  },
  
  stencil: function(node) {
    var gl = getGL();
    var shouldRender3D = node._shouldRender3D;
    var program = shouldRender3D ? this.program3D : this.program;
    gl.useProgram(program);
    
    gl.clearStencil(0);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.colorMask(false, false, false, false);
    gl.stencilFunc(gl.ALWAYS, 1, ~0);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
    
    // look up where the vertex data needs to go.
    var positionLocation = program.positionLocation;
    gl.bindBuffer(gl.ARRAY_BUFFER, program.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, node.rectangleArray, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, shouldRender3D ? 3 : 2, gl.FLOAT, false, 0, 0);
    
    gl.uniform1f(program.alphaLocation, node._alpha);
    
    if (this._shouldRender3D) {
      gl.uniformMatrix4fv(program.matrixLocation, false, node._matrix);
    }
    else {
      gl.uniformMatrix3fv(program.matrixLocation, false, node._matrix);
    }
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.colorMask(true, true, true, true);
    gl.depthMask(gl.TRUE);
    gl.stencilFunc(gl.EQUAL, 1, ~0);
    gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
  },
});
GameEngine.nodeRenderer = new GameEngine.NodeRenderer();