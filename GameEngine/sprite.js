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
    
    if (url) {
      this.load();
    }
  },
  
  _atlas: null,
  setAtlas: function(imageURL, jsonURL, frameFileName) {
    this.url = imageURL;
    this._atlas = getJSONFromCache(jsonURL);
    
    this.load(function() {
      this.setFrameImage(frameFileName);
    }.bind(this));
  },
  
  setFrameImage: function(frameFileName) {
    var atlas = this._atlas;
    var image = this.image;
    var frames = atlas["frames"];
    
    var foundFrame;
    for (var i = 0; i < frames.length; i ++) {
      var frame = frames[i];
      var filename = frame["filename"];
      if (filename === frameFileName) {
        foundFrame = frame;
      }
    }
    
    var imageWidth = image.width;
    var imageHeight = image.height;
    
    var inFrame = foundFrame.frame;
    var frame = {x: inFrame.x, y: inFrame.y, width: inFrame.w, height: inFrame.h};
    var sourceSize = foundFrame["spriteSourceSize"];
    this._texturePadding = {left: sourceSize.w - frame.width - sourceSize.x, bottom: sourceSize.h - frame.height - sourceSize.y, right: sourceSize.x, top: sourceSize.y};
    this.setContentSize({width: sourceSize.w, height: sourceSize.h});
    
    this.textureFrame = {x: frame.x, y: frame.y, width: frame.width, height: frame.height};
    
    frame.y = image.height - frame.y - frame.height;
    
    
    
    frame.x /= image.width;
    frame.y /= image.height;
    frame.width /= image.width;
    frame.height /= image.height;
    
//    this.rectangleTextureArray = new Float32Array([
//      frame.x,            frame.y,
//      frame.x + frame.width,  frame.y,
//      frame.x,            frame.y + frame.height,
//      frame.x,            frame.y + frame.height,
//      frame.x + frame.width,  frame.y,
//      frame.x + frame.width,  frame.y + frame.height]
//    );
    
    this.rectangleTextureArray = new Float32Array([
      frame.x + frame.width, frame.y + frame.height,
      frame.x + frame.width, frame.y,
      frame.x, frame.y,
      frame.x, frame.y + frame.height
    ]);
    
    /*
    rectangleTextureArray[index + 0] = 0.0;
        rectangleTextureArray[index + 1] = 0.0;
        
        rectangleTextureArray[index + 2] = 0.0;
        rectangleTextureArray[index + 3] = 1.0;
        
        rectangleTextureArray[index + 4] = 1.0;
        rectangleTextureArray[index + 5] = 1.0;
        
        rectangleTextureArray[index + 6] = 1.0;
        rectangleTextureArray[index + 7] = 0.0;
        */
    
    this._update();
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
    
    if (!GameEngine.sharedEngine.legacyCanvasMode) {
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
    }
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
  
  frameDictionary: {},
  startFrameAnimation: function(imageNames, frameDuration, loop, completion) {
    this._startFrameAnimation(0, imageNames, frameDuration, loop, completion);
  },
  
  _startFrameAnimation: function(index, imageNames, frameDuration, loop, completion) {
    if (index >= imageNames.length) {
      if (loop) {
        this._startFrameAnimation(0, imageNames, frameDuration, loop, completion);
      }
      else {
        if (completion) {
          completion();
        }
      }
      return;
    }
      
    this.setFrameImage(imageNames[index]);
    
    setTimeout(function() {
      this._startFrameAnimation(index + 1, imageNames, frameDuration, loop, completion);
    }.bind(this), frameDuration * 1000.0);
  },
  
  _doesDraw: function() {
    return true;
  },
  
  render: function() {
    GameEngine.spriteRenderer.render(this);
  },
  
});