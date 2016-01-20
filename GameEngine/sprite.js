GameEngine.Sprite = GameEngine.Node.extend({
  _className: "GameEngine.Sprite",
  
  url: null,
  image: null,
  _renderImage: null,
  textures: null,
  _loaded: false,
  _overlayColour: {r: 0.0, g: 0.0, b: 0.0, a: 0.0},
  _testLoadCallback: null,
  _global: {},

  init: function(url) {
    this._super(null);
  
    this._doesDraw = true;
    this.url = url;
    this.textures = {};
    this._renderer = GameEngine.spriteRenderer;
    this._batchRenderer = GameEngine.batchSpriteRenderer;
    
    this.load();
  },
  
  load: function(completion) {
    var image;
  
    var url = this.url;
    var protocol = url.length > 5 ? url.substring(0, 5) : "";
    
    if (protocol === "data:") {
      image = new Image();
      image.src = url;
    }
    else {
      image = getImageFromCache(this.url);
    }
    
    if (image) {
      this.setContentSize({width: image.width, height: image.height});
    }
  
//    this._super(function() {
      var completionFunction = function(image) {
        this.setImage(image);
          this._loaded = true;
          
          this._update();
          
          if (completion) {
            completion();
          }
          
          if (this._testLoadCallback) {
            this._testLoadCallback();
          } 
      }.bind(this);
      
      if (image) {
        completionFunction(image);
      }
      else {
        console.log("DEBUG - GameEngine.Sprite - Loading image that was not preloaded", image, this.url);
        loadImage(this.url, function(image) {
          this.setContentSize({width: image.width, height: image.height});
          completionFunction(image);
        }.bind(this));
      }
//    }.bind(this));
    
    
  },
  
  setShadowEnabled: function(enabled) {
//    this._super(enabled);
  },
  
  setImage: function(image) {
    if (image === this.image) {
      return;
    }
	
    this.image = image;
    
    var gl = getGL();
    
    var texture = image.texture;
    if (!texture) {
      texture = gl.createTexture();
      
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Set the parameters so we can render any size image.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      // Upload the image into the texture.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
      image.texture = texture;
    }
    else {
      gl.bindTexture(gl.TEXTURE_2D, texture);
    }
    
    this.texture = texture;
  },
  
  _shouldUpdateOverlayColour: false,
  setOverlayColour: function(overlayColour) {
    this._overlayColour = overlayColour;
  
    var shouldRender3D = this._shouldRender3D;
    var program = shouldRender3D ? this.program3D : this.program;
    if (program) {
      var gl = getGL();
      gl.useProgram(program);
      gl.uniform4f(program.overlayColourLocation, overlayColour.r, overlayColour.g, overlayColour.b, overlayColour.a);
      this._update();
    }
    else {
      this._shouldUpdateOverlayColour = true;
    }
  },
  
  _updateContent: function(clipRect) {
//    var gl = getGL();
//    var program = this.program;
//    
//    if (program) {
//      gl.useProgram(program);
//      
//      var contentSize = this.getContentSize();
//      var xPercent = clipRect.x / contentSize.width;
//      
////      if (clipRect.x > 0) {
////        xPercent = 0.5;
////      }
//      
//      var yPercent = clipRect.y / contentSize.height;
//      var widthPercent = clipRect.width / contentSize.width;
//      var heightPercent = clipRect.height / contentSize.height;
//        
//      var texCoordBuffer = gl.createBuffer();
//      var rectangleTextureArray = new Float32Array([
//        xPercent,  yPercent,
//        xPercent + widthPercent,  yPercent,
//        xPercent,  yPercent + heightPercent,
//        xPercent,  yPercent + heightPercent,
//        xPercent + widthPercent,  yPercent,
//        xPercent + widthPercent,  yPercent + heightPercent]
//      );
//      
//      if (clipRect.x > 0) {
//        console.log("rectangleTextureArray", xPercent, widthPercent, clipRect.x);
//      }
//      
//      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
//      gl.bufferData(gl.ARRAY_BUFFER, rectangleTextureArray, gl.STATIC_DRAW);
//      
//      gl.enableVertexAttribArray(program.texCoordLocation);
//      gl.vertexAttribPointer(program.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
//    }
  },
  
  frameDictionary: {},
  startFrameAnimation: function(imagePaths, frameDuration, completion) {
    var imageCount = imagePaths.length;
    
    for (var i = 0; i < imageCount; i ++) {
      var imagePath = imagePaths[i];
//    imagePaths.forEach(function(imagePath) {
      loadImage(imagePath, function(image) {
        this.frameDictionary[imagePath] = image;
        
        imageCount --;
        if (imageCount === 0) {
          this._startFrameAnimation(0, imagePaths, frameDuration, completion);
        }
      }.bind(this));
//    }.bind(this));
    }
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
    this._scene.dirty = true;
    this.texture = null;
    
    setTimeout(function() {
      this._startFrameAnimation(index + 1, imagePaths, frameDuration, completion);
    }.bind(this), frameDuration * 1000.0);
  },
  
  _doesDraw: function() {
    return true;
  },
  
  /* CANVAS METHODS */
  
  
  renderForCanvas: function() {
    console.log("RENDER FOR CANVAS");
  
    var image = this._renderImage;
    if (!image || !this._loaded)		{
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
    
    context.translate(position.x, position.y);
    context.rotate(angleInRadians);
    context.globalAlpha = this._alpha;
    context.drawImage(image, - contentSize.width * anchorPoint.x, - contentSize.height * anchorPoint.y, contentSize.width, contentSize.height);
    context.rotate(- angleInRadians);
    context.translate(- position.x, - position.y);
    
    // Restore the transform
    context.restore();
  },
  
});