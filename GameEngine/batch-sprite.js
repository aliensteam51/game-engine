GameEngine.Sprite = GameEngine.Node.extend({
  url: null,
  image: null,
  _renderImage: null,
  textures: null,
  loaded: false,

  init: function(url) {
    this._super();
  
    this.url = url;
    this.textures = {};
    this.doesDraw = true;
  },
  
  load: function(completion) {
    this.setupGL(function() {
      loadImage(this.url, function(image) {
        this.setImage(image);
        this.setContentSize({width: image.width, height: image.height});
        this.loaded = true;
        
        if (completion) {
          completion();
        }
      }.bind(this));
    }.bind(this));
  },
  
  setShadowEnabled: function(enabled) {
//    this._super(enabled);
  },
  
  setImage: function(image) {
    if (image === this.image) {
      return;
    }
	
    this.image = image;
    
    var renderImage;
    if (this.isShadowEnabled) {
      renderImage = GameEngine.effectHelper.getShadowImage([image], {x: 2.0, y: 2.0}, 10.0);
    }
    else {
      renderImage = image;
    }
    
     
    
    var gl = getGL();
    
    var texture = image.texture;
    if (!texture) {
      console.log("CREATING TEXTURE");
      texture = gl.createTexture();
      
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Set the parameters so we can render any size image.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      // Upload the image into the texture.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, renderImage);
    
      image.texture = texture;
    }
    else {
      gl.bindTexture(gl.TEXTURE_2D, texture);
    }
    
    this.texture = texture;
  },
  
  frameDictionary: {},
  startFrameAnimation: function(imagePaths, frameDuration, completion) {
    var imageCount = imagePaths.length;
    
    imagePaths.forEach(function(imagePath) {
      loadImage(imagePath, function(image) {
        this.frameDictionary[imagePath] = image;
        
        imageCount --;
        if (imageCount === 0) {
          this._startFrameAnimation(0, imagePaths, frameDuration, completion);
        }
      }.bind(this));
    }.bind(this));
  },
  
  _startFrameAnimation: function(index, imagePaths, frameDuration, completion) {
    if (index >= imagePaths.length) {
//      if (completion) {
//        completion();
//      }

      this._startFrameAnimation(0, imagePaths, frameDuration, completion);
      return;
    }
    
    this._renderImage = this.frameDictionary[imagePaths[index]];
    this.scene.dirty = true;
    this.texture = null;
    
    setTimeout(function() {
      this._startFrameAnimation(index + 1, imagePaths, frameDuration, completion);
    }.bind(this), frameDuration * 1000.0);
  },
  
  /* CANVAS METHODS */
  
  
  renderForCanvas: function() {
    console.log("RENDER FOR CANVAS");
  
    var image = this._renderImage;
    if (!image || !this.loaded)		{
      return;
    }
	
    var canvas = getCanvas();
    var context = canvas.getContext('2d');
    
    var position = this.getPosition();
    var contentSize = this.getContentSize();
    var scale = this._scale;
    var anchorPoint = this._anchorPoint;
    
    contentSize.width *= scale;
    contentSize.height *= scale;
    
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
    context.drawImage(image, - contentSize.width * anchorPoint.x, - contentSize.height * anchorPoint.y, contentSize.width, contentSize.height);
    context.rotate(- angleInRadians);
    context.translate(- position.x, - position.y);
    
    // Restore the transform
    context.restore();
  },
  
  /* WEBGL METHODS */
  
  global: {program: null},
  
  createProgram: function(completion) {
    var gl = getGL();
  
    var program = this.global.program;
    if (!program) {
      console.log("CREATING PROGRAM");
    
      var script1 = document.getElementById("sprite-fsh");
      var script2 = document.getElementById("particle-node.vsh");
      var scripts = [script1, script2];
    
      // First load the shader scripts
      loadScripts(scripts, 0, function() {
        program = createProgramFromScripts(gl, "sprite-fsh", "particle-node.vsh");
        
        program.positionLocation = gl.getAttribLocation(program, "a_position");
        
        
        program.texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
        
        program.texCoordBuffer = gl.createBuffer();
        
        
//        gl.bindBuffer(gl.ARRAY_BUFFER, program.texCoordBuffer);
//        gl.bufferData(gl.ARRAY_BUFFER, program.rectangleTextureArray, gl.STATIC_DRAW);
////        
//        var texCoordLocation = program.texCoordLocation
//        gl.enableVertexAttribArray(texCoordLocation);
//        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        
        program.alphaLocation = gl.getUniformLocation(program, "tAlpha");
        program.buffer = gl.createBuffer();
//        
//        gl.bindBuffer(gl.ARRAY_BUFFER, program.buffer);
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(12), gl.DYNAMIC_DRAW);
        
        this.global.program = program;
        
        if (completion) {
          completion(program);
        }
      }.bind(this));
    }
    else {
      if (completion) {
        completion(program);
      }
    }
    
//    this.buffer = gl.createBuffer();
  },
  
  rectangleArrays: {},
  rectangleArray: null,
  setContentSize: function(contentSize) {
    this._super(contentSize);
    var key = "" + contentSize.width + "x" + contentSize.height;
    var rectangleArray = this.rectangleArrays[key];
    if (!rectangleArray) {
      rectangleArray = new Float32Array([ 
        0.0, 0.0,
        0.0 + contentSize.width, 0.0,
        0.0, 0.0 + contentSize.height,
        0.0, 0.0 + contentSize.height,
        0.0 + contentSize.width, 0.0,
        0.0 + contentSize.width, 0.0 + contentSize.height]
      );
      console.log("ARRAY", rectangleArray);
      this.rectangleArrays[key] = rectangleArray;
    }
    this.rectangleArray = rectangleArray;
  },
  
  test: {currentTexture: null, currentRectangleArray: null, currentAlpha: -1.0},
  
  clara: function(count) {
    var gl = getGL();
    var program = this.program;
    if (program) {
      gl.useProgram(program);
      
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      
      var rectangleTextureArray = new Float32Array(count * 8);
      for (var i = 0; i < count; i ++) {
        var index = i + 7 * i;
        rectangleTextureArray[index] = 0.0;
        rectangleTextureArray[index + 1] = 1.0;
        
        rectangleTextureArray[index + 2] = 1.0;
        rectangleTextureArray[index + 3] = 1.0;
        
        rectangleTextureArray[index + 4] = 0.0;
        rectangleTextureArray[index + 5] = 0.0;
        
        rectangleTextureArray[index + 6] = 1.0;
        rectangleTextureArray[index + 7] = 0.0;
      }
      
      gl.bindBuffer(gl.ARRAY_BUFFER, program.texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, rectangleTextureArray, gl.STATIC_DRAW);
    
      var texCoordLocation = program.texCoordLocation;
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
//      
      gl.bindBuffer(gl.ARRAY_BUFFER, program.buffer);
        
      // setup a rectangle from 10,20 to 80,30 in pixels,
//      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.rectangleArray);
      
//      var positionLocation = program.positionLocation;
//      gl.enableVertexAttribArray(positionLocation);
//      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      
      gl.uniform1f(program.alphaLocation, this._alpha);
    }
  },
  
  render: function() {
    var texture = this.texture;
    if (!texture || !this.loaded) {
      return;
    }
    this._super();
	
    var gl = getGL();
    var program = this.program;
    
    var contentSize = this.getContentSize();
    
    
    
    if (this.test.currentRectangleArray !== this.rectangleArray) {
      this.test.currentRectangleArray = this.rectangleArray;
      
      
    }
    
//    gl.bindBuffer(gl.ARRAY_BUFFER, program.texCoordBuffer);
//    gl.bufferData(gl.ARRAY_BUFFER, program.rectangleTextureArray, gl.STATIC_DRAW);
    
//    var texCoordLocation = program.texCoordLocation
//    gl.enableVertexAttribArray(texCoordLocation);
//    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    
//    if (this.test.currentAlpha !== this._alpha) {
//      this.test.currentAlpha = this._alpha;
      gl.uniform1f(program.alphaLocation, this._alpha);
//    }
//    else {
//      console.log("this.test.currentAlpha", this.test.currentAlpha);
//    }
    
    if (test.currentTexture !== texture) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      test.currentTexture = texture;
    }
  }
  
});