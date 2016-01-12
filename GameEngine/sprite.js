GameEngine.Sprite = GameEngine.Node.extend({
  _className: "GameEngine.Sprite",
  
  url: null,
  image: null,
  _renderImage: null,
  textures: null,
  loaded: false,
  _overlayColour: {r: 0.0, g: 0.0, b: 0.0, a: 0.0},
  


  init: function(url, loadCallback) {
    this.doesDraw = true;
  
    this._super(null, loadCallback);
  
    this.url = url;
    this.textures = {};
  },
  
  load: function(completion) {
    this._super(function() {
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
  
  setOverlayColour: function(overlayColour) {
    this._overlayColour = overlayColour;
  
    var program = this.program;
    
    var gl = getGL();
    gl.useProgram(program);
    gl.uniform4f(program.overlayColourLocation, overlayColour.r, overlayColour.g, overlayColour.b, overlayColour.a);
  
    this._update();
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
  setupGL: function(completion) {
    var script1 = document.getElementById("sprite-fsh");
    var script2 = document.getElementById("node-vsh");
    var scripts = [script1, script2];
    
    var superMethod = this._super;
  
    // First load the shader scripts
    loadScripts(scripts, 0, function() {
      var gl = getGL();
      program = createProgramFromScripts(gl, "sprite-fsh", "node-vsh");
      gl.useProgram(program);
      
      var texCoordBuffer = gl.createBuffer();
      var rectangleTextureArray = new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0]
      );
      
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, rectangleTextureArray, gl.STATIC_DRAW);
      
      var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
      
      program.overlayColourLocation = gl.getUniformLocation(program, "overlayColour");
      gl.uniform4f(program.overlayColourLocation, 0.0, 0.0, 0.0, 0.0);
      
      this.program = program;
      
      superMethod.call(this, completion);
    }.bind(this));
  },
  
  test: {currentTexture: null, currentRectangleArray: null, currentAlpha: -1.0},
  
  render: function() {
    var texture = this.texture;
    if (!texture || !this.loaded) {
      return;
    }
    
    var gl = getGL();
    var program = this.program;
    gl.useProgram(program);
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    if (this._overlayColour) {
      var overlayColour = this._overlayColour;
      gl.useProgram(program);
      gl.uniform4f(program.overlayColourLocation, overlayColour.r, overlayColour.g, overlayColour.b, overlayColour.a);
    }
    
    this._super();
  }
  
});