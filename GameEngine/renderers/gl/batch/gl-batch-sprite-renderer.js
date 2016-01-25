GameEngine.GLBatchSpriteRenderer = GameEngine.GLBatchNodeRenderer.extend({
  _className: "GameEngine.BatchSpriteRenderer",
  _programScripts: [["batch-sprite.fsh", "simple-batch-sprite.vsh"], ["batch-sprite.fsh", "batch-sprite.vsh"], ["batch-sprite.fsh", "batch-sprite-3d.vsh"]],
  _doesDraw: true,
  
  setupGL: function() {
    this._super();
  
    var gl = this._gl;
    var programKeys = this._programKeys;
    for (var i = 0; i < programKeys.length; i ++) {
      var programKey = programKeys[i];
      var program = this[programKey];
      gl.useProgram(program);
      
      var bufferItemLength = 1000;
      
      program.texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
      program.overlayColourLocation = gl.getAttribLocation(program, "aOverlayColour");
      
      program.texCoordBuffer = createBuffer(4, 2, bufferItemLength, gl);
      program.overlayColourBuffer = createBuffer(4, 4, bufferItemLength, gl);
    }
  },
  
  rectangleTextureArray: null,
  
  render: function(sprites) {
    var sprite = sprites[0];
    
    var gl = this._gl;
    var renderMode = sprites[0]._renderMode;
    var program = this[this._programKeys[renderMode]];
    
    var batchChanged = sprites.changed;
    
    var texCoordLocation = program.texCoordLocation;
    var texCoordBuffer = program.texCoordBuffer;
    var texCoordArray = texCoordBuffer.array;
    var texCoordElemSize = texCoordBuffer.elemSize;
    var texCoordArraySize = texCoordBuffer.arraySize;
    var texCoordIndex = 0;
    var textCoordModified = batchChanged;
    
    var overlayColourLocation = program.overlayColourLocation;
    var overlayColourBuffer = program.overlayColourBuffer;
    var overlayColourArray = overlayColourBuffer.array;
    var overlayColourElemSize = overlayColourBuffer.elemSize;
    var overlayColourArraySize = overlayColourBuffer.arraySize;
    var overlayColourIndex = 0;
    var overlayColourModified = batchChanged;
    
    var nodeFunction = function(sprite) {
      // TEXTURE POSITIONS
//      if (sprite._batchRectangleTextureChanged) {
//        sprite._batchRectangleTextureChanged = false;
        textCoordModified = true;
      
        var spriteRectangleTextureArray = sprite.batchRectangleTextureArray;
        if (spriteRectangleTextureArray) {
            texCoordArray[texCoordIndex + 0] = spriteRectangleTextureArray[0];
            texCoordArray[texCoordIndex + 1] = spriteRectangleTextureArray[1];
            
            texCoordArray[texCoordIndex + 2] = spriteRectangleTextureArray[2];
            texCoordArray[texCoordIndex + 3] = spriteRectangleTextureArray[3];
            
            texCoordArray[texCoordIndex + 4] = spriteRectangleTextureArray[4];
            texCoordArray[texCoordIndex + 5] = spriteRectangleTextureArray[5];
            
            texCoordArray[texCoordIndex + 6] = spriteRectangleTextureArray[6];
            texCoordArray[texCoordIndex + 7] = spriteRectangleTextureArray[7];
        }
        else {
          texCoordArray[texCoordIndex + 0] = 1.0;
          texCoordArray[texCoordIndex + 1] = 1.0;
          
          texCoordArray[texCoordIndex + 2] = 1.0;
          texCoordArray[texCoordIndex + 3] = 0.0
          
          texCoordArray[texCoordIndex + 4] = 0.0;
          texCoordArray[texCoordIndex + 5] = 0.0;
          
          texCoordArray[texCoordIndex + 6] = 0.0;
          texCoordArray[texCoordIndex + 7] = 1.0;
        }
//      }
      
      texCoordIndex += 8;
      
      // OVERLAY COLOUR
      if (sprite._overlayColourChanged) {
        sprite._overlayColourChanged = false;
        overlayColourModified = true;
      
        var overlayColour = sprite._overlayColour;
        if (!overlayColour) {
          overlayColour = {r: 0.0, g: 0.0, b: 0.0, a: 0.0};
        }
        
        for (var i = 0; i < overlayColourArraySize; i ++) {
          overlayColourArray[overlayColourIndex] = overlayColour.r;
          overlayColourArray[overlayColourIndex + 1] = overlayColour.g;
          overlayColourArray[overlayColourIndex + 2] = overlayColour.b;
          overlayColourArray[overlayColourIndex + 3] = overlayColour.a;
          
          overlayColourIndex += 4;
        }
      }
      else {
        overlayColourIndex += 4 * overlayColourArraySize;
      }
    };
    
    var endFunction = function() {
      // Bind the texture
      gl.bindTexture(gl.TEXTURE_2D, sprites[0].texture);
      
//      if (textCoordModified) {
        // TEXTURE POSITIONS
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, texCoordArray);
        
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, texCoordElemSize, gl.FLOAT, false, 0, 0);
//      }
      
      if (overlayColourModified) {
        // OVERLAY COLOUR
        gl.bindBuffer(gl.ARRAY_BUFFER, overlayColourBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, overlayColourArray);
      
        gl.enableVertexAttribArray(overlayColourLocation);
        gl.vertexAttribPointer(overlayColourLocation, overlayColourElemSize, gl.FLOAT, false, 0, 0);
      }
    };
    
    this._super(sprites, nodeFunction, endFunction);
  }
});