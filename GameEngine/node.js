GameEngine.Node = GameEngine.Object.extend({
  _className: "GameEngine.Node",

  /**
   *  @property {Array} _children
   *  @description The children of the node
   */
  _children: null,

  /** 
   *  @property {Dictionary} _contentSize 
   *  @description The content size of the node, use getContentSize() or setContentSize({width: 0.0, height: 0.0})
   */
  _contentSize: {width: 0.0, height: 0.0},
  
  /** 
   *  @property {Dictionary} _position
   *  @description The position of the node, use getPosition() or setPosition({x: 0.0, y: 0.0})
   */
  _position: {x: 0.0, y: 0.0},
  
  /** 
   *  @property {Number} _alpha 
   *  @description The alpha value of the node, use getAlpha() or setAlpha(1.0)
   */
  _alpha: 1.0,
  
  /**
   *  @property {Number} _rotation
   *  @description The rotation of the node, use getRotation() or setRotation(180.0)
   */
   //TODO: Add more rotation axes
  _rotation: 0.0,
  
  /**
   *  @property {Dictionary} anchorPoint
   *  @description The nodes anchorpoint, all animations use this point, use getAnchorPoint() or setAnchorPoint({x: 0.0, y: 0.0})
   */
  _anchorPoint: {x: 0.5, y: 0.5},
  
  /**
   *  @property {Number} scale
   *  @description The scale of the node
   */
  _scale: 1.0,
  
  /**
   *  @property {GameEngine.Scene} scene
   *  @description The scene the node belongs to
   */
  scene: null,
  
  /**
   *  @property {Number} zIndex
   *  @description The z-index of the node
   */
  zIndex: 0,
  
  /**
   * @property {Boolean} isShadowEnabled
   * @property If shadow should be drawn or not
   */
  isShadowEnabled: false,
  
  //TODO: sort this out
  // Snap back test
  xDiff: 0.0,
  yDiff: 0.0,
  origPostion: 0.0,
  animationKeys: null,
  doesDraw: false,
  _animationTimers: null,
  
  
  /**
   *  @method init
   *  @desription Creates a new node object
   *
   *  @example var node = new GameEngine.Node();
   */
  init: function(contentSize, loadCallback) {
    this._super();
    
    this.animationKeys = [];
    this._animationTimers = [];
//    this.updateMatrixes();
    
    this._children = [];
    
    this.setup(contentSize, loadCallback);
  },
  
  setup: function(contentSize, loadCallback) {
    this.load(function() {
      if (loadCallback) {
        loadCallback();
      }
      
      if (contentSize) {
        this.setContentSize(contentSize);
      }
    }.bind(this));
  },
  
  load: function(completion) {
    this.setupGL(completion);
  },
  
  addChild: function(child) {
    if (child instanceof GameEngine.Node) {
      child.parent = this;
      child._setScene(this.scene);
      this._children.push(child);
    }
    else {
      console.log("WARNING - GameEngine.Node - Not a instance of GameEngine.Node", child);
    }
  },
  
  _setScene: function(scene) {
    this.scene = scene;
    this._children.forEach(function(child) {
      child._setScene(scene);
    });
  },
  
  positionInScene: function() {
    var parent = this.parent;
    if (parent) {
      return parent.convertToScene(this.getPosition());
    }
    else {
      return this.getPosition();
    }
  },
  
  convertToScene: function(position) {
    var parent = this.parent;
    if (parent) {
      var myPosition = this.getPosition();
      parent.convertToScene({x: myPosition.x + position.x, y: myPosition.y + position.y});
    }
    else {
      return {x: position.x, y: position.y};
    }
  },
  
  removeFromParent: function() {
    var children = this.parent.children;
    var index = children.indexOf(this);
    if (index !== -1) {
      children.splice(index, 1);
    }
  },
  
  removeChild: function(child) {
    var children = this._children;
    var index = children.indexOf(child);
    if (index !== -1) {
      this._children.splice(index, 1);
    }
  },
  
  update: function() {
  },
  
  rectangleArray: null,
  /**
   *  @method setContentSize
   *  @description Set the content size of the node
   *  @param {Dictionary} contentSize The new content size to set
   *
   *  @example node.setContentSize({width: 100.0, height: 100.0})
   */
  setContentSize: function(contentSize) {
    var currentContentSize = this._contentSize;
    if (currentContentSize.width === contentSize.width && currentContentSize.height === contentSize.height) {
      return;
    }
  
    this._contentSize = {width: contentSize.width, height: contentSize.height};
    
    this.rectangleArray = new Float32Array([ 
      0.0, 0.0,
      0.0 + contentSize.width, 0.0,
      0.0, 0.0 + contentSize.height,
      0.0, 0.0 + contentSize.height,
      0.0 + contentSize.width, 0.0,
      0.0 + contentSize.width, 0.0 + contentSize.height]
    );
    
    this.updateMatrix();
    this._update();
  },
  
  /**
   *  @method getContentSize
   *  @description Get the content size of the node
   *  @return {Dictionary} Returns the size of the node (widht and height)
   *
   *  @example var contentSize = node.getContentSize()
   */
  getContentSize: function() {
    var contentSize = this._contentSize;
    return {width: contentSize.width, height: contentSize.height};
  },
  
  /**
   *  @method setPosition
   *  @description Set the position of the node
   *  @param {Dictionary} position The new position to set
   *
   *  @example node.setPosition({x: 0.0, y: 0.0})
   */
  setPosition: function(position) {
    var currentPosition = this._position;
    if (currentPosition.x === position.x && currentPosition.y === position.y) {
      return;
    }
    
    this._position = {x: position.x, y: position.y};
    
    this.updateMatrix();
    this._update();
  },
  
  /**
   *  @method getPosition
   *  @description Get the position of the node
   *  @return {Dictionary} The position in x, y coordinates
   *  
   *  @example var position = node.getPosition()
   */
  getPosition: function() {
    var position = this._position;
    return {x: position.x, y: position.y};
  },
  
  /**
   *  @method setAlpha
   *  @description Set the alpha value of the node
   *  @param {Number} alpha The new alpha value to set
   *
   *  @example node.setAlpha(0.5)
   */
  setAlpha: function(alpha) {
    this._alpha = alpha;
    this._update();
  },
  
  /**
   *  @method getAlpha
   *  @description Get the alpha of the node
   *  @return {Number} Returns the nodes alpha value
   *
   *  @example var alpha = node.getAlpha()
   */
  getAlpha: function() {
    return this._alpha;
  },
  
  /**
   *  @method setRotation
   *  @description Set the rotation of the node
   *  @param {Number} rotation thie new rotation in degrees
   *
   *  @example node.setRotation(180)
   */
  setRotation: function(rotation) {
    if (this._rotation === rotation) {
      return;
    }
  
    this._rotation = rotation;
    
    this.updateMatrix();
    this._update();
  },
  
  /**
   *  @method getRotation
   *  @description Get the rotation of the node
   *  @return Returns the nodes rotation in degrees
   *
   *  @example var rotation = node.getRotation()
   */
  getRotation: function() {
    return this._rotation;
  },
  
  /**
   *  @method setAnchorPoint
   *  @description Change the nodes anchor point
   *  @param anchorPoint {Dictionary} The anchor point to set
   *
   *  @example node.setAnchorPoint({0.5, 0.5})
   */
  setAnchorPoint: function(anchorPoint) {
    this._anchorPoint = {x: anchorPoint.x, y: anchorPoint.y};
  },
  
  /**
   *  @method getAnchorPoint
   *  @description Get the anchor point of the node
   *  @return Returns an anchor point dictionary (x, y)
   *
   *  @example var anchorPoint = this.getAnchorPoint()
   */
  getAnchorPoint: function() {
    var anchorPoint = this._anchorPoint;
    return {x: anchorPoint.x, y: anchorPoint.y};
  },
  
  /**
   *  @method setScale
   *  @description Set the scale of the node
   *  @param {Number} scale thie new scale
   *
   *  @example node.setRotation(180)
   */
  setScale: function(scale) {
    if (scale === this._scale) {
      return;
    }
  
    this._scale = scale;
    
    this.updateMatrix();
    this._update();
  },
  
  /**
   *  @method getScale
   *  @description Get the scale of the node
   *  @return Returns the scale value
   *
   *  @example var scale = node.getScale()
   */
  getScale: function() {
    return this._scale;
  },
  
  /**
   *  @method setShadowEnabled
   *  @description Enable shadow on the node
   *  @param {Boolean} shadowEnabled If the shadow should be enabled
   *
   *  @example node.setShadowEnabled(true)
   */
  setShadowEnabled: function(shadowEnabled) {
    this.isShadowEnabled = shadowEnabled;
  },
  
  onTouchBegan: function(event) {
    return false;
  },
  
  
  onTouchMoved: function(event) {
  },
  
  onTouchEnded: function(event) {
  
  },
  
  onMouseEnter: function(event) {
  },
  
  onMouseExit: function(event) {
  
  },
  
  stopAllAnimations: function() {
    this._animationTimers.forEach(function(timeout) {
      clearTimeout(timeout);
    });
  
    this.animationKeys.forEach(function(animationKey) {
      GameEngine.sharedEngine.removeScheduledActionWithKey(animationKey);
    });
  },
  
  moveTo: function(duration, newPosition, completion) {
    newPosition.x = Math.round(newPosition.x);
    newPosition.y = Math.round(newPosition.y);
    
    if (duration < (1.0 / 60.0)) {
      this.setPosition(newPosition);
      setTimeout(completion, duration * 1000.0);
      return;
    }
    
    var position = this._position;
    
    var animationKeys = this.animationKeys;
    var animationID = "_moveBy_" + this._id;
    animationKeys.push(animationID);
    
    var now = Date.now();
    var gameEngine = GameEngine.sharedEngine;
    
    setTimeout(function() {
      gameEngine.removeScheduledActionWithKey(animationID);
      
        this.setPosition(newPosition);
        
        var animationIndex = animationKeys.indexOf(animationID);
        if (animationIndex !== -1) {
          animationKeys.splice(animationID);
        }
        
        if (completion) {
          completion();
        }
    }.bind(this), duration * 1000.0);
    
    gameEngine.addScheduledActionWithKey(function() {
      this._moveTo(position, newPosition, now, duration);
    }.bind(this), animationID);
  },
  
  _moveTo: function(startPosition, endPosition, startTime, duration) {
    var xStep = (endPosition.x - startPosition.x);
    var yStep = (endPosition.y - startPosition.y);
    
    var now = Date.now();
    var percentage = ((now - startTime) / 1000.0) / duration;
    if (percentage <= 1) {
      this.setPosition({x: startPosition.x + (xStep * percentage), y: startPosition.y + (yStep * percentage)});
    }
  },
  
  fadeTo: function(duration, newAlpha, completion) {
    if (duration < (1.0 / 60.0)) {
      this.setAlpha(newAlpha);
      setTimeout(completion, duration * 1000.0);
      return;
    }
    
    var alpha = this._alpha;
    
    var animationKeys = this.animationKeys;
    var animationID = "_fadeTo_" + this._id;
    animationKeys.push(animationID);
    
    var now = Date.now();
    var gameEngine = GameEngine.sharedEngine;
    
    setTimeout(function() {
      gameEngine.removeScheduledActionWithKey(animationID);
      
        this.setAlpha(newAlpha);
        
        var animationIndex = animationKeys.indexOf(animationID);
        if (animationIndex !== -1) {
          animationKeys.splice(animationID);
        }
        
        if (completion) {
          completion();
        }
    }.bind(this), duration * 1000.0);
    
    gameEngine.addScheduledActionWithKey(function() {
      this._fadeTo(alpha, newAlpha, now, duration);
    }.bind(this), animationID);
  },
  
  _fadeTo: function(startAlpha, endAlpha, startTime, duration) {
    var alphaStep = (endAlpha - startAlpha);
    
    var now = Date.now();
    var percentage = ((now - startTime) / 1000.0) / duration;
    if (percentage <= 1) {
      this.setAlpha(alphaStep * percentage);
    }
  },
  
  scaleTo: function(duration, newScale, completion) {
    var scale = this._scale;
    var frames = (duration / (1.0 / 60.0));
    var step = (newScale - scale) / frames;
    
    var animationKeys = this.animationKeys;
    var animationID = "_scaleBy_" + this._id;
    animationKeys.push(animationID);
    
    var gameEngine = GameEngine.sharedEngine;
    gameEngine.addScheduledActionWithKey(function() {
      this._scaleBy(1.0 / 60.0, newScale, step, function() {
        gameEngine.removeScheduledActionWithKey(animationID);
        
        var animationIndex = animationKeys.indexOf(animationID);
        if (animationIndex !== -1) {
          animationKeys.splice(animationID);
        }
        
        if (completion) {
          completion();
        }
      });
    }.bind(this), animationID);
  },
  
  _scaleBy: function(delay, newScale, step, completion) {
    var scale = this._scale;
      
    if (scale !== newScale) {
      scale = scale + step;
    }
    
    if (step > 0 && scale > newScale || step < 0 && scale < newScale) {
      scale = newScale;
    }
    
    this.setScale(scale);
    
    if (scale === newScale) {
      if (completion) {
        completion();
      }
    }
  },
  
  rotateTo: function(duration, newRotation, completion) {
    if (duration < (1.0 / 60.0)) {
      this.setRotation(newRotation);
      setTimeout(completion, duration * 1000.0);
      return;
    }
    
    var rotation = this._rotation;
    
    var animationKeys = this.animationKeys;
    var animationID = "_rotateBy_" + this._id;
    animationKeys.push(animationID);
    
    var now = Date.now();
    var gameEngine = GameEngine.sharedEngine;
    var rotateTimer = setTimeout(function() {
      gameEngine.removeScheduledActionWithKey(animationID);
      
        this.setRotation(newRotation);
        
        var animationIndex = animationKeys.indexOf(animationID);
        if (animationIndex !== -1) {
          animationKeys.splice(animationID);
        }
        
        var animationTimers = this._animationTimers;
        var index = animationTimers.indexOf(rotateTimer);
        if (index !== -1) {
          animationTimers.splice(index, 1);
        }
        
        if (completion) {
          completion();
        }
    }.bind(this), duration * 1000.0);
   this._animationTimers.push(rotateTimer);
    
    gameEngine.addScheduledActionWithKey(function() {
      this._rotateTo(rotation, newRotation, now, duration);
    }.bind(this), animationID);
  },
  
  _rotateTo: function(startDegrees, endDegrees, startTime, duration) {
    var rotationStep = endDegrees - startDegrees;
    
    var now = Date.now();
    var percentage = ((now - startTime) / 1000.0) / duration;
    if (percentage <= 1.0) {
      this.setRotation(startDegrees + (rotationStep * percentage));
    }
  },
  
  _update: function() {
    if (needsUpdate(this)) {
      var scene = this.scene;
      if (scene) {
        scene.dirty = true;
      }
    }
  },
  
  /* WEBGL METHODS */
  
  buffer: null,
  resolutionLocation: null,
  
  createProgram: function() {
    return null;
  },
  
  setupGL: function(completion) {
    if (this.doesDraw) {
      var gl = getGL();
      var program = this.program;
      
      program.matrixLocation = gl.getUniformLocation(program, "u_matrix");
      program.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      program.positionLocation = gl.getAttribLocation(program, "a_position");
      program.alphaLocation = gl.getUniformLocation(program, "tAlpha");
      
      // Set the alpha mode and enable blending
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      
      gl.useProgram(program);
      
      var canvas = getCanvas();
      gl.uniform2f(program.resolutionLocation, canvas.width, canvas.height);
      
      program.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, program.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(12), gl.DYNAMIC_DRAW);
      
      if (completion) {
        completion();
      }
    }
    else {
      if (completion) {
        completion();
      }
    }
  },
  
  _matrix: null,
  updateMatrix: function() {
    var contentSize = this._contentSize;
    
    // Scale
    var scale = this._scale;
    var scaleMatrix = makeScale(scale, scale);
    
    // Rotation
    var angleInDegrees = this._rotation;
    var angleInRadians = angleInDegrees * Math.PI / 180;
    rotationMatrix = makeRotation(angleInRadians);
    
    // Translation
    var position = this._position;
    var translationMatrix = makeTranslation(position.x, position.y);
    
    // Multiply them
    var moveOriginMatrix = makeTranslation(- contentSize.width / 2.0, - contentSize.height / 2.0);
    var matrix = matrixMultiply(moveOriginMatrix, scaleMatrix);
    matrix = matrixMultiply(matrix, rotationMatrix);
    this._matrix = matrixMultiply(matrix, translationMatrix);
    
    if (this.parent) {
      this._matrix = matrixMultiply(this._matrix, this.parent._matrix);
    }
    
    this._children.forEach(function(child) {
      child.updateMatrix();
    });
  },
  
  program: null,
  
  currentProgram: {currentProgram: null},
  
  render: function() {
    if (this.doesDraw) {
      var gl = getGL();
      var program = this.program;
      gl.useProgram(program);
      
      // look up where the vertex data needs to go.
      var positionLocation = program.positionLocation;
      gl.bindBuffer(gl.ARRAY_BUFFER, program.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.rectangleArray, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      
      gl.uniform1f(program.alphaLocation, this._alpha);
      gl.uniformMatrix3fv(program.matrixLocation, false, this._matrix);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    
//    this._children.forEach(function(child) {
//      child.render();
//    });
  },
  
  renderForCanvas: function() {
  },
  
  indexBuffer: null,
  indices: null,
  draw: function() {
    if (!this.program) {
      return;
    }
    
    if (!this.doesDraw) {
      return;
    }
  
    var gl = getGL();
    
  }

});

function needsUpdate(node) {
  if (node.doesDraw === true) {
    return true;
  }
  
  var doesDraw = false;
  node._children.forEach(function(child) {
    if (child.doesDraw) {
      doesDraw = true;
    }
  });
  
  return doesDraw;
}