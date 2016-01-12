GameEngine.Node = GameEngine.Object.extend({
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
  zIndex: -1,
  
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
  
  
  /**
   *  @method init
   *  @desription Creates a new node object
   *
   *  @example var node = new GameEngine.Node();
   */
  init: function() {
    this._super();
    
    this.animationKeys = [];
//    this.updateMatrixes();
  },
  
  update: function() {
  },
  
  /**
   *  @method setContentSize
   *  @description Set the content size of the node
   *  @param {Dictionary} contentSize The new content size to set
   *
   *  @example node.setContentSize({width: 100.0, height: 100.0})
   */
  setContentSize: function(contentSize) {
    this._contentSize = {width: contentSize.width, height: contentSize.height};
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
//    this.updateTranslationMatrix();

//    var position = this._position;
//    var gl = getGL();
//    var program = this.program;
//    if (program) {
//      gl.useProgram(program);
//      gl.uniform2fv(program.translationLocation, [position.x, position.y]);
//    }

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
    this.updateRotationMatrix();
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
    this._scale = scale;
    
    var gl = getGL();
    var program = this.program;
    
    // Set the scale.
    gl.uniform2fv(program.scaleLocation, [scale, scale]);
    
//    this.updateScaleMatrix();
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
  },
  
  
  onTouchMoved: function(event) {
  },
  
  onTouchEnded: function(event) {
  },
  
  stopAllAnimations: function() {
    this.animationKeys.forEach(function(animationKey) {
      GameEngine.sharedEngine.removeScheduledActionWithKey(animationKey);
    });
  },
  
  moveTo: function(duration, newPosition, completion) {
    newPosition.x = Math.round(newPosition.x);
    newPosition.y = Math.round(newPosition.y);
  
    var position = this._position;
    var frames = (duration / (1.0 / 60.0));
    var xStep = (newPosition.x - position.x) / frames;
    var yStep = (newPosition.y - position.y) / frames;
    
    console.log("xStep", xStep, (newPosition.x - position.x), frames);
    
    var animationKeys = this.animationKeys;
    var animationID = "_moveBy_" + this._id;
    animationKeys.push(animationID);
    
    var gameEngine = GameEngine.sharedEngine;
    gameEngine.addScheduledActionWithKey(function() {
      this._moveBy(1.0 / 60.0, newPosition, xStep, yStep, function() {
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
  
  _moveBy: function(delay, newPosition, xStep, yStep, completion) {
    var position = this._position;
      
    if (position.x !== newPosition.x) {
      position.x = position.x + xStep;
    }
    
    if (position.y !== newPosition.y) {
      position.y = position.y + yStep;
    }
    
    if (xStep > 0 && position.x > newPosition.x || xStep < 0 && position.x < newPosition.x) {
      position.x = newPosition.x;
    }
    
    if (yStep > 0 && position.y > newPosition.y || yStep < 0 && position.y < newPosition.y) {
      position.y = newPosition.y;
    }
    
    this.setPosition(position);
    
    if (position.x === newPosition.x && position.y === newPosition.y) {
      if (completion) {
        completion();
      }
    }
  },
  
  fadeTo: function(duration, newAlpha, completion) {
    var alpha = this._alpha;
    var frames = (duration / (1.0 / 60.0));
    var step = (newAlpha - alpha) / frames;
    
    var animationKeys = this.animationKeys;
    var animationID = "_fadeBy_" + this._id;
    animationKeys.push(animationID);
    
    var gameEngine = GameEngine.sharedEngine;
    gameEngine.addScheduledActionWithKey(function() {
      this._fadeBy(1.0 / 60.0, newAlpha, step, function() {
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
  
  _fadeBy: function(delay, newAlpha, step, completion) {
    var alpha = this._alpha;
      
    if (alpha !== newAlpha) {
      alpha = alpha + step;
    }
    
    if (step > 0 && alpha > newAlpha || step < 0 && alpha < newAlpha) {
      alpha = newAlpha;
    }
    
    this.setAlpha(alpha);
    
    if (alpha === newAlpha) {
      if (completion) {
        completion();
      }
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
    var rotation = this._rotation;
    var frames = (duration / (1.0 / 60.0));
    var step = (newRotation - rotation) / frames;
    
    var animationKeys = this.animationKeys;
    var animationID = "_rotateBy_" + this._id;
    animationKeys.push(animationID);
    
    var gameEngine = GameEngine.sharedEngine;
    gameEngine.addScheduledActionWithKey(function() {
      this._rotateBy(1.0 / 60.0, newRotation, step, function() {
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
  
  _rotateBy: function(delay, newRotation, step, completion) {
    var rotation = this._rotation;
      
    if (rotation !== newRotation) {
      rotation = rotation + step;
    }
    
    if (step > 0 && rotation > newRotation || step < 0 && rotation < newRotation) {
      rotation = newRotation;
    }
    
    this.setRotation(rotation);
    
    if (rotation === newRotation) {
      if (completion) {
        completion();
      }
    }
  },
  
  _update: function() {
    if (this.doesDraw) {
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
    this.createProgram(function(program) {
      var gl = getGL();
//      program.matrixLocation = gl.getUniformLocation(program, "u_matrix");
      program.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      
      program.translationLocation = gl.getAttribLocation(program, "u_translation");
//      program.scaleLocation = gl.getUniformLocation(program, "u_scale");
//      program.rotationLocation = gl.getUniformLocation(program, "u_rotation");
      
      // Set the alpha mode and enable blending
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      
      gl.useProgram(program);
      
      gl.uniform2f(program.rotationLocation, 0.0, 1.0);
      gl.uniform2f(program.scaleLocation, 1.0, 1.0);
//      gl.uniform2f(program.translationLocation, 100.0, 0.0);
      
      var canvas = getCanvas();
      gl.uniform2f(program.resolutionLocation, canvas.width, canvas.height);
      
      this.program = program;
      
      if (completion) {
        completion();
      }
    }.bind(this));
  },
  
//  matrix: null,
//  translationMatrix: null,
//  rotationMatrix: null,
//  scaleMatrix: null,
//  
//  updateMatrixes: function() {
//    this.updateTranslationMatrix();
//    this.updateRotationMatrix();
//    this.updateScaleMatrix();
//  },
//  
//  updateTranslationMatrix: function() {
//    var position = this._position;
//    this.translationMatrix = makeTranslation(position.x, position.y);
//  
//    if (this.testMatrix) {
//      this.translationMatrix[6] -= this.testMatrix[6];
//      this.translationMatrix[7] -= this.testMatrix[7];
//      
//      var gl = getGL();
//      gl.uniform1f(this.program.test1, this.translationMatrix[6]);
//      gl.uniform1f(this.program.test2, this.translationMatrix[7]);
//      
////      var test1 = position.x - this.testMatrix[6];
////      var test2 = position.y - this.testMatrix[7];
////      this.matrix = this.translationMatrix;
////      this.matrix = matrixMultiply(this.testMatrix, this.translationMatrix);
////      console.log("TEST MATRIX", this.testMatrix, this.translationMatrix, this.matrix);
//    }
//    else {
////      this.translationMatrix = makeTranslation(position.x, position.y);
//      this.matrix = null;
//    }
//  },
//  
//  updateRotationMatrix: function() {
//    var angleInDegrees = this._rotation;
//    var angleInRadians = angleInDegrees * Math.PI / 180;
//    this.rotationMatrix = makeRotation(angleInRadians);
//    
//    this.matrix = null;
//  },
//  
//  updateScaleMatrix: function() {
//    var scale = this.scale;
//    this.scaleMatrix = makeScale(scale, scale);
//    
//    this.matrix = null;
//  },
  
  program: null,
  
//  testMatrix: null,
  
  currentProgram: {currentProgram: null},
  
  render: function() {
    if (!this.doesDraw) {
      return;
    }
	
    var gl = getGL();
  
    // setup a GLSL program
    var program = this.program;
    if (!program) {
      console.log("GameEngine.Node - render: Drawing subclass doesn't have a WebGL program - ABORTING RENDER");
      return;
    }
    
    if (this.currentProgram.currentProgram !== program) {
      this.currentProgram.currentProgram = program;
      gl.useProgram(program);
    }
    
    // Set the translation.
    
//    gl.uniform2fv(program.translationLocation, [this._position.x, this._position.y]);
    
    
    // Set the matrix.
//    var matrix = this.matrix;
//    if (!matrix) {
//      // Multiply the matrices.
//      var contentSize = this._contentSize;
//      var moveOriginMatrix = makeTranslation(- contentSize.width / 2.0, - contentSize.height / 2.0);
//      var matrix = matrixMultiply(moveOriginMatrix, this.scaleMatrix);
//      matrix = matrixMultiply(matrix, this.rotationMatrix);
//      this.testMatrix = matrix;
//      matrix = matrixMultiply(matrix, this.translationMatrix);
//      
//      this.matrix = matrix;
//      
//      gl.uniformMatrix3fv(this.program.matrixLocation, false, matrix);
//    }
//    
  },
  
  renderForCanvas: function() {
  },
  
  indexBuffer: null,
  indices: null,
  doesDraw: true,
  draw: function() {
    if (!this.program) {
      return;
    }
    
    if (!this.doesDraw) {
      return;
    }
  
    var gl = getGL();
//    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    
    
    
    
  }

});