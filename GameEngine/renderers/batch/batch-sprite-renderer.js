GameEngine.BatchSpriteRenderer = GameEngine.BatchNodeRenderer.extend({
  _className: "GameEngine.BatchSpriteRenderer",
  _programScripts: [["batch-sprite.fsh", "simple-batch-sprite.vsh"], ["batch-sprite.fsh", "batch-sprite.vsh"], ["batch-sprite.fsh", "batch-sprite-3d.vsh"]],
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
      
      program.texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
      program.overlayColourLocation = gl.getAttribLocation(program, "aOverlayColour");
      
      program.texCoordBuffer = gl.createBuffer();
      program.overlayColourBuffer = gl.createBuffer();
//    }.bind(this));
    }
  },
  
  rectangleTextureArray: null,
  
  render: function(sprites) {
    var sprite = sprites[0];
  
    var gl = getGL();
    var shouldRender3D = sprite._shouldRender3D;
    var renderMode = sprites[0]._renderMode;
      
      // = node._shouldRender3D;
    var program = this[this._programKeys[renderMode]];
    //shouldRender3D ? this.program3D : this.program;
    gl.useProgram(program);
    
    gl.bindTexture(gl.TEXTURE_2D, sprites[0].texture);
    
//    var rectangleTextureArray = this.rectangleTextureArray;
//    if (!rectangleTextureArray) {
    // TEXTURE COORDS
      
//      if (!rectangleTextureArray) {
      var rectangleTextureArray = new Float32Array(sprites.length * 8);
      for (var i = 0; i < sprites.length; i ++) {
        var index = i * 8;
        var sprite = sprites[i];
        var spriteRectangleTextureArray = sprite.rectangleTextureArray;
        
        rectangleTextureArray[index + 0] = spriteRectangleTextureArray ? spriteRectangleTextureArray[0] : 1.0;
        rectangleTextureArray[index + 1] = spriteRectangleTextureArray ? spriteRectangleTextureArray[1] : 1.0;
        
        rectangleTextureArray[index + 2] = spriteRectangleTextureArray ? spriteRectangleTextureArray[2] : 1.0;
        rectangleTextureArray[index + 3] = spriteRectangleTextureArray ? spriteRectangleTextureArray[3] : 0.0
        
        rectangleTextureArray[index + 4] = spriteRectangleTextureArray ? spriteRectangleTextureArray[4] : 0.0;
        rectangleTextureArray[index + 5] = spriteRectangleTextureArray ? spriteRectangleTextureArray[5] : 0.0;
        
        rectangleTextureArray[index + 6] = spriteRectangleTextureArray ? spriteRectangleTextureArray[6] : 0.0;
        rectangleTextureArray[index + 7] = spriteRectangleTextureArray ? spriteRectangleTextureArray[7] : 1.0;
        ;
      }
//      }
//      this.rectangleTextureArray = rectangleTextureArray;
//    }
    gl.bindBuffer(gl.ARRAY_BUFFER, program.texCoordBuffer);
    
    var textCoordCreated = this._textCoordCreated;
    if (!textCoordCreated) {
      gl.bufferData(gl.ARRAY_BUFFER, rectangleTextureArray, gl.DYNAMIC_DRAW);
    }
    else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, rectangleTextureArray);
    }
    
    gl.enableVertexAttribArray(program.texCoordLocation);
    gl.vertexAttribPointer(program.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
//    }
    
    // OVERLAY COLOUR
//    var overlayColourArray = new Float32Array(sprites.length * 4 * 6);
//    sprites.forEach(function(sprite) {
//      var overlayColour = sprite._overlayColour;
//      if (!overlayColour) {
//        overlayColour = {r: 0.0, g: 0.0, b: 0.0, a: 0.0};
//      }
//      
//      for (var i = 0; i < 6; i ++) {
//        var index = i + i * 4;
//        overlayColourArray[index] = overlayColour.r;
//        overlayColourArray[index + 1] = overlayColour.g;
//        overlayColourArray[index + 2] = overlayColour.b;
//        overlayColourArray[index + 3] = overlayColour.a;
//      }
//    });
//    
//    var overlayColourLocation = program.overlayColourLocation;
//    gl.bindBuffer(gl.ARRAY_BUFFER, program.overlayColourBuffer);
//    gl.bufferData(gl.ARRAY_BUFFER, overlayColourArray, gl.STATIC_DRAW);
//    gl.enableVertexAttribArray(overlayColourLocation);
//    gl.vertexAttribPointer(overlayColourLocation, 4, gl.FLOAT, false, 0, 0);
    
    this._super(sprites);
  }
});
GameEngine.batchSpriteRenderer = new GameEngine.BatchSpriteRenderer();