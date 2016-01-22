GameEngine.GLSpriteRenderer = GameEngine.GLNodeRenderer.extend({
  _className: "GameEngine.GLSpriteRenderer",
  _programScripts: [["sprite.fsh", "simple-sprite.vsh"], ["sprite.fsh", "sprite.vsh"], ["sprite.fsh", "sprite-3d.vsh"]],
  _doesDraw: true,
  
  setupGL: function() {
    this._super();
  
    var gl = getGL();
    var programKeys = this._programKeys;
    for (var i = 0; i < programKeys.length; i ++) {
      var programKey = programKeys[i];
      var program = this[programKey];
      gl.useProgram(program);
      
      this.rectangleTextureArray = new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0]
      );
      
      program.overlayColourLocation = gl.getUniformLocation(program, "overlayColour");
      gl.uniform4f(program.overlayColourLocation, 0.0, 0.0, 0.0, 0.0);
    }
  },
  
  render: function(sprite) {
    var texture = sprite.texture;
    if (!texture || !sprite._loaded) {
      return;
    }
    
    var gl = getGL();
    var shouldRender3D = sprite._shouldRender3D;
    var program = shouldRender3D ? this.program3D : this.program;
    gl.useProgram(program);
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    if (sprite._overlayColour) {
      var overlayColour = sprite._overlayColour;
      gl.useProgram(program);
      gl.uniform4f(program.overlayColourLocation, overlayColour.r, overlayColour.g, overlayColour.b, overlayColour.a);
    }
    
    var rectangleTextureArray = sprite.rectangleTextureArray;
    if (!rectangleTextureArray) {
      rectangleTextureArray = this.rectangleTextureArray;
    }
    
    var texCoordBuffer = gl.createBuffer();
    program.texCoordBuffer = texCoordBuffer;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rectangleTextureArray, gl.STATIC_DRAW);
    
    program.texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(program.texCoordLocation);
    gl.vertexAttribPointer(program.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    
    this._super(sprite);
  }
});