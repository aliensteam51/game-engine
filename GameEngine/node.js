GameEngine.Node = GameEngine.Object.extend({
  _className: "GameEngine.Node",
  
  /**
   *  @property {Bool} _loaded
   *  @description If the node is loaded or not
   */
  _loaded: true,

  /**
   *  @property {Array} _children
   *  @description The children of the node
   */
  _children: null,
  
  /**
   *  @property {Object} _parent
   *  @description The parent of the node
   */
  _parent: null,

  /** 
   *  @property {Dictionary} _contentSize 
   *  @description The content size of the node, use getContentSize() or setContentSize({width: 0.0, height: 0.0})
   */
  _contentSize: null,
  
  /** 
   *  @property {Dictionary} _position
   *  @description The position of the node, use getPosition() or setPosition({x: 0.0, y: 0.0})
   */
  _position: null,
  
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
  _rotation: {x: 0.0, y: 0.0, z: 0.0},
  
  /**
   *  @property {Dictionary} _anchorPoint
   *  @description The nodes anchorpoint, all animations use this point, use getAnchorPoint() or setAnchorPoint({x: 0.0, y: 0.0})
   */
  _anchorPoint: {x: 0.5, y: 0.5},
  
  /**
   *  @property {Number} _scale
   *  @description The scale of the node
   */
  _scale: 1.0,
  
  /**
   *  @property {GameEngine.Scene} _scene
   *  @description The scene the node belongs to
   */
  _scene: null,
  
  /**
   *  @property {Number} _zIndex
   *  @description The z-index of the node
   */
  _zIndex: 0,
  
  /**
   *  @property {Array} _animationKeys
   *  @description The current animation keys of the current running animations
   */
  _animationKeys: null,
  
  /**
   *  @property {Array} _animationTimers
   *  @description The current animation timers
   */
  _animationTimers: null,
  
  /**
   *  @property {Bool} _doesDraw
   *  @description If the node draws itself or not
   */
  _doesDraw: false,
  
  /**
   *  @property {Bool} _touchEnabled
   *  @description If touch is enabled on the node it will receive input events
   */
  _touchEnabled: false,
  
  /**
   *  @property {Bool} _clipsToBounds
   *  @description If the node clips its children to its bounds
   */
  _clipsToBounds: false,
  
  _x: null,
  _y: null,
  _z: null,
  _width: null,
  _height: null,
  
  _shouldRender3D: false,
  _global: {},
  _renderer: null,
  _batchRenderer: null,
  _renderMode: GameEngine.RenderMode.Normal,
  _yScaleMultiplier: 1.0,
  _yStartTranslation: 0.0,
  _isVisible: false,
  
  _scaleMatrixInfo: null,
  _rotationMatrixInfo: null,
  _translationMatrixInfo: null,
  _originMatrixInfo: null,
  _anchorScaleMatrixInfo: null,
  _anchorScaleRotationMatrixInfo: null,
  _ownMatrixInfo: null,
  _matrix: null,
  _parentMatrix: null,
  
  _shouldUpdateMatrix: false,
  
  /**
   *  @method init
   *  @desription Creates a new node object
   *
   *  @example var node = new GameEngine.Node();
   */
  init: function(newContentSize) {
    this._super();
    
    if (GameEngine.sharedEngine.legacyCanvasMode) {
      this._yScaleMultiplier = -1.0;
//      this._yStartTranslation = - contentSize.height;
    }
    
    // Create basic information storage objects
    this._animationKeys = [];
    this._animationTimers = [];
    this._children = [];
    this._renderer = GameEngine.nodeRenderer;
    
    // Setup the basic properties
    var width = 0.0;
    var height = 0.0;
    if (newContentSize) {
      width = newContentSize.width;
      height = newContentSize.height;
      
      width = width ? width : 0.0;
      height = height ? height : 0.0;
    }
    
//    this._width = width;
//    this._height = height;
    this._contentSize_t = [0.0, 0.0];
        
    this._x = 0.0;
    this._y = 0.0;
    this._z = 0.0;
    
//    this._position = {x: 0.0, y: 0.0};
    this._translation_t = [0.0, 0.0];
    
    // Setup the basic matrices
    var scaleMatrix = makeScale(1.0, 1.0, []);
    this._scaleMatrixInfo = {shouldUpdate: false, matrix: scaleMatrix};
    
    var rotationMatrix = makeRotation(0.0, []);
    this._rotationMatrixInfo = {shouldUpdate: false, matrix: rotationMatrix};
    
    var translationMatrix = makeRotation(0.0, []);
    this._translationMatrixInfo = {shouldUpdate: false, matrix: translationMatrix};
    
    var anchorPoint = this._anchorPoint;
    var originMatrix = makeTranslation(- width * anchorPoint.x, - height * anchorPoint.y, []);
    this._originMatrixInfo = {shouldUpdate: false, matrix: originMatrix};
    
    var anchorScaleMatrix = matrixMultiply(originMatrix, scaleMatrix, []);
    this._anchorScaleMatrixInfo = {shouldUpdate: false, matrix: anchorScaleMatrix};
    
    var anchorScaleRotationMatrix = matrixMultiply(anchorScaleMatrix, rotationMatrix, []);
    this._anchorScaleRotationMatrixInfo = {shouldUpdate: false, matrix: anchorScaleRotationMatrix};
    
    var ownMatrix = matrixMultiply(anchorScaleRotationMatrix, translationMatrix, []);
    this._ownMatrixInfo = {shouldUpdate: false, matrix: ownMatrix};
    
    this._parentMatrix = [1, 0, 0,
                          0, 1, 0,
                          0, 0, 1];
    
    this._matrix = ownMatrix;
    
    this.rectangleArray = new Float32Array(12);
    this.setContentSize(newContentSize);
    
    this._update();
  },
  
  addChild: function(child) {
    if (child instanceof GameEngine.Node) {
      child._parent = this;
      child._setScene(this._scene);
      this._children.push(child);
      if (child instanceof GameEngine.Sprite) {
        var batchArray = child.image.texture.batchArray;
        if (batchArray) {
          batchArray.push(child);
          batchArray.changed = true;
        }
        else {
          this._renderList = null;
        }
      }
      else {
       this._renderList = null;
      }
      var scene = this._scene;
      if (scene) {
        scene.dirty = true;
      }
    }
    else {
      console.log("WARNING - GameEngine.Node - Not a instance of GameEngine.Node", child);
    }
  },
  
  getParent: function() {
    return this._parent;
  },
  
  _setScene: function(scene) {
    this._scene = scene;
    
    if (this._renderMode === GameEngine.RenderMode.Normal) {
      this._shouldUpdateMatrix = true;
    }
    this._update();
    
    var children = this._children;
    for (var i = 0; i < children.length; i ++) {
      var child = children[i];
//    this._children.forEach(function(child) {
      child._setScene(scene);
//    });
    }
  },
  
  getScene: function() {
    return this._scene;
  },
  
  convertScenePosition: function(scenePosition) {
    var positionInScene = this.positionInScene();
    var anchorPoint = this._anchorPoint;
    
    positionInScene.x -= this._width * anchorPoint.x;
    positionInScene.y -= this._height * anchorPoint.y;
    
    return {x: scenePosition.x - positionInScene.x, y: scenePosition.y - positionInScene.y};
  },
  
  positionInScene: function() {
    var parent = this._parent;
    if (parent) {
      return parent.convertToScene({x: this._x, y: this._y});
    }
    else {
      return this._position;
    }
  },
  
  convertToScene: function(position) {
    var parent = this._parent;
    if (parent) {
      var myPosition = this.getPosition();
      var contentSize = this.getContentSize();
      var anchorPoint = this.getAnchorPoint();
      myPosition.x -= contentSize.width * anchorPoint.x;
      myPosition.y -= contentSize.height * anchorPoint.y;
      return parent.convertToScene({x: myPosition.x + position.x, y: myPosition.y + position.y});
    }
    else {
      return {x: position.x, y: position.y};
    }
  },
  
  removeFromParent: function() {
    var parent = this._parent;
    if (parent) { 
      this._setScene(null);
      
      var children = parent._children;
      var index = children.indexOf(this);
      if (index !== -1) {
        children.splice(index, 1);
        
        var parentScene = parent._scene;
        if (parentScene) {
          if (this instanceof GameEngine.Sprite) {
            var batchArray = this.image.texture.batchArray;
            if (batchArray) {
              var index = batchArray.indexOf(this);
              batchArray.splice(index, 1);
              batchArray.changed = true;
            }
            else {
              parentScene._renderList = null;
            }
          }
          else {
            parentScene._renderList = null;
          }
          parentScene.dirty = true;
        }
      }
    }
  },
  
  removeChild: function(child) {
    child._setScene(null);
  
    var children = this._children;
    var index = children.indexOf(child);
    if (index !== -1) {
      this._children.splice(index, 1);
      
      scene._renderList = null;
      var scene = this._scene;
      if (scene) {
        scene.dirty = true;
      }
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
  setContentSize: function(newContentSize) {
    if (!newContentSize) {
      return;
    }
    
    var width = this._width;
    var height = this._height;
    
    var newWidth = newContentSize.width;
    var newHeight = newContentSize.height;
    console.log("_setContentSize", width, height, newWidth, newHeight);
    if (width === newWidth && height === newHeight) {
      return;
    }
    
    newWidth = newWidth !== null && newWidth !== undefined ? newWidth : width;
    newHeight = newHeight !== null && newHeight !== undefined ? newHeight : height;
  
    this._setContentSize(newWidth, newHeight);
  },
  
  _setContentSize: function(width, height) {
    console.log("_setContentSize", width, height);
    var sizeChanged = width !== this._width && height !== this._height;
    this._width = width;
    this._height = height;
    
    var contentSize_t = this._contentSize_t;
    contentSize_t[0] = width;
    contentSize_t[1] = height;

      if (this._isVisible) {
        this.updateRectangleArray();
        this._update();
      }
      if (this._renderMode === GameEngine.RenderMode.Normal && sizeChanged) {
        this._originMatrixInfo.shouldUpdate = true;
        this._anchorScaleMatrixInfo.shouldUpdate = true;
        this._anchorScaleRotationMatrixInfo.shouldUpdate = true;
        this._ownMatrixInfo.shouldUpdate = true;
        
        this._shouldUpdateMatrix = true;
        this._update();
      }
  },
  
  setTouchEnabled: function(enabled) {
    this._touchEnabled = enabled;
  },
  
  isTouchEnabled: function() {
    return this._touchEnabled;
  },
  
  _renderList: null,
  
  _getRenderList: function() {
    var renderList = this._renderList;
    if (!renderList) {
      var children = this._children.slice();
      children.push(this);
      children = children.sort(function(node1, node2) {
        if (node1 === this) {
          return node2._zIndex > -1 ? -1 : 1;
        }
        else if (node2 === this) {
          return node1._zIndex > -1 ? 1 : -1;
        }
        
        return node1._zIndex - node2._zIndex;
      }.bind(this));
      
      var newChildren = [];
      var previousChild;
      var batchArray;
      for (var i = 0; i < children.length; i ++) {
        var child = children[i];
        if (child instanceof GameEngine.ColourNode) {
        console.log("CHILD", child, child._isVisible);
        }
        if (child !== this) {
          child._prepareForRender();
        }
        
        if (child !== this && child._zIndex > -1 && (child instanceof GameEngine.Sprite) && child._isVisible) {
          if (previousChild) {
            var texture = child.image.texture;
            if (previousChild.image.texture === texture) {
              if (!batchArray) {
                batchArray = [previousChild];
                texture.batchArray = batchArray;
              }
              batchArray.push(child);
              batchArray.changed = true;
              child.isAddded = true;
              
              var previousChildIndex = newChildren.indexOf(previousChild);
              if (previousChildIndex !== -1) {
                newChildren.splice(previousChildIndex, 1);
              }
              
              previousChild = child;
            }
            else {
              if (batchArray && batchArray.length > 0) {
                newChildren.push(batchArray);
                batchArray = null;
              }
              newChildren.push(child);
              previousChild = child;
            }
          }
          else {
            newChildren.push(child);
            previousChild = child;
          }
        }
        else if (child._isVisible) {
          newChildren.push(child);
        }
      }
      if (previousChild && previousChild.isAddded) {
        previousChild.isAddded = null;
        var previousChildIndex = newChildren.indexOf(previousChild);
        if (previousChildIndex !== -1) {
          newChildren.splice(previousChildIndex, 1);
        }
      }
      
      if (batchArray) {
        newChildren.push(batchArray);
      }
      
      var finalList = [];
      for (var i = 0; i < newChildren.length; i ++) {
        var child = newChildren[i];
//      newChildren.forEach(function(child) {
        if (child !== this && !(child instanceof Array)) {
          var renderList = child._getRenderList();
          finalList.push.apply(finalList, renderList);
        }
        else {
          finalList.push(child);
        }
//      }.bind(this));
      }
      
      renderList = finalList;
      
      this._renderList = renderList;
    }
    else {
      for (var i = 0; i < renderList.length; i ++) {
        var child = renderList[i];
        if (child !== this) {
          if (child instanceof Array) {
            for (var y = 0; y < child.length; y ++) {
              var subChild = child[y];
              subChild._prepareForRender();
            }
          }
          else {
            child._prepareForRender();
          }
        }
      }
    }
    
    return renderList;
  },
  
  /**
   *  @method getContentSize
   *  @description Get the content size of the node
   *  @return {Dictionary} Returns the size of the node (widht and height)
   *
   *  @example var contentSize = node.getContentSize()
   */
  getContentSize: function() {
    return {width: this._width, height: this._height};
  },
  
  /**
   *  @method setPosition
   *  @description Set the position of the node
   *  @param {Dictionary} position The new position to set
   *
   *  @example node.setPosition({x: 0.0, y: 0.0})
   */
  setPosition: function(newPosition) {
    if (!newPosition) {
      return;
    }
    
    var x = this._x;
    var y = this._y;
    var z = this._z;
    
    var newX = newPosition.x;
    var newY = newPosition.y;
    var newZ = newPosition.z;
    
    if (x === newX && y === newY && z === newZ) {
      return;
    }
    
    newPosition =  {  x: newX !== null && newX !== undefined ? newX : x,
                      y: newY !== null && newY !== undefined ? newY : y,
                      z: newZ !== null && newZ !== undefined ? newZ : z};
    
    this._setPosition(newPosition.x, newPosition.y, newPosition.z);
  },
  
  _setPosition: function(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
  
//    var scenePosition = this.positionInScene();
//    this._translation_t = [scenePosition.x, scenePosition.y];
    
    if (this._renderMode === GameEngine.RenderMode.Normal) {
      this._translationMatrixInfo.shouldUpdate = true;
      this._ownMatrixInfo.shouldUpdate = true;
      this._shouldUpdateMatrix = true;
    }
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
    return {x: this._x, y: this._y, z: this._z};
  },
  
  /**
   *  @method setAlpha
   *  @description Set the alpha value of the node
   *  @param {Number} alpha The new alpha value to set
   *
   *  @example node.setAlpha(0.5)
   */
  _alphaChanged: true,
  setAlpha: function(alpha) {
    _alphaChanged = true;
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
   *  @example node.setRotation(180 or {x: 180.0, y: 0.0, z: 0.0})
   */
  _rotation_t: [0.0, 1.0],
  setRotation: function(rotation) {
    if (this._rotation === rotation) {
      return;
    }
    
    if ((!isNaN(parseFloat(rotation)) && isFinite(rotation))) {
      this._rotation.z = rotation;
    }
    else {
      this._rotation = {x: rotation.x ? rotation.x : 0.0, y: rotation.y ? rotation.y : 0.0, z: rotation.z ? rotation.z : 0.0};
    }
    
    if (this._rotation.x !== 0 || this._rotation.y !== 0 && !this._shouldRender3D) {
      this._setRenderMode(GameEngine.RenderMode.Advanced);
    }
    
    var shaderRotation = [];
    var angleInRadians = this._rotation.z * Math.PI / 180;
    shaderRotation[0] = Math.sin(angleInRadians);
    shaderRotation[1] = Math.cos(angleInRadians);
    this._rotation_t = shaderRotation;

    if (this._renderMode === GameEngine.RenderMode.Normal) {
      this._rotationMatrixInfo.shouldUpdate = true;
      this._translationMatrixInfo.shouldUpdate = true;
      this._originMatrixInfo.shouldUpdate = true;
      this._anchorScaleMatrixInfo.shouldUpdate = true;
      this._anchorScaleRotationMatrixInfo.shouldUpdate = true;
      this._ownMatrixInfo.shouldUpdate = true;
      
      this._shouldUpdateMatrix = true;
    }
    
    this._update();
  },
  
  _setRenderMode: function(renderMode) {
    this._renderMode = renderMode;
  
    if (renderMode === GameEngine.RenderMode.Normal) {
      this._rotationMatrix = null;
      this._translationMatrix = null;
      this._moveOriginMatrix = null;
      this._anchorScaleMatrix = null;
      this._anchorScaleRotationMatrix = null;
      this._ownMatrix = null;
      
      this._shouldUpdateMatrix = true;
    }
    
    var children = this._children;
    for (var i = 0; i < children.length; i ++) {
      var child = children[i];
      child._setRenderMode(renderMode);
    }
  },
  
  /**
   *  @method getRotation
   *  @description Get the rotation of the node
   *  @return Returns the nodes rotation in degrees
   *
   *  @example var rotation = node.getRotation()
   */
  getRotation: function() {
    var rotation = this._rotation;
    return {x: rotation.x, y: rotation.y, z: rotation.z};
  },
  
  /**
   *  @method setAnchorPoint
   *  @description Change the nodes anchor point
   *  @param anchorPoint {Dictionary} The anchor point to set
   *
   *  @example node.setAnchorPoint({0.5, 0.5})
   */
  _anchorPoint_t: [0.5, 0.5],
  setAnchorPoint: function(anchorPoint) {
    this._anchorPoint = {x: anchorPoint.x, y: anchorPoint.y};
    this._anchorPoint_t = [anchorPoint.x, anchorPoint.y];
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
  _scale_t: [1.0, 1.0],
  setScale: function(scale) {
    if (scale === this._scale) {
      return;
    }
  
    this._scale = scale;
    this._scale_t = [scale, scale];
    
    if (this._renderMode === GameEngine.RenderMode.Normal) {
      this._scaleMatrixInfo.shouldUpdate = true;
      this._shouldUpdateMatrix = true;
    }
    
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
   *  @method setZIndex
   *  @description Sets the nodes z index
   *  @param {Number} zIndex The new z index to set
   *
   *  @example node.setZIndex(100)
   */
  setZIndex: function(zIndex) {
    this._zIndex = zIndex;
    
    var scene = this._scene;
    if (scene) {
      scene._renderList = null;
    }
    this._update();
  },
  
  /**
   *  @method getZIndex
   *  @description Get the nodes z index
   *  @return {Number} Returns a zIndex number
   *
   *  @example var zIndex = node.getZIndex()
   */
  getZIndex: function() {
    return this._zIndex;
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
    var animationTimers = this._animationTimers;
    for (var i = 0; i < animationTimers.length; i ++) {
      var timeout = animationTimers[i];
//    this._animationTimers.forEach(function(timeout) {
      clearTimeout(timeout);
//    });
    }
    
    var animationKeys = this._animationKeys;
    for (var i = 0; i < animationKeys.length; i ++) {
      var animationKey = animationKeys[i];
//    this._animationKeys.forEach(function(animationKey) {
      GameEngine.sharedEngine.removeScheduledActionWithKey(animationKey);
//    });
    }
  },
  
  moveTo: function(duration, newPosition, completion) {
    var newX = Math.round(newPosition.x);
    var newY = Math.round(newPosition.y);
    var newZ = Math.round(newPosition.z);
    
    if (duration < getInterval() / 1000.0) {
      this._setPosition(newX, newY, 0.0);
      setTimeout(completion, duration * 1000.0);
      return;
    }
    
    var startX = this._x;
    var startY = this._y;
    var startZ = this._z;
    
    var animationKeys = this._animationKeys;
    var animationID = "_moveTo_" + this._id;
    animationKeys.push(animationID);
    
    var now = Date.now();
    var gameEngine = GameEngine.sharedEngine;
    
    setTimeout(function() {
      gameEngine.removeScheduledActionWithKey(animationID);
      
        this._setPosition(newX, newY, newZ);
        
        var animationIndex = animationKeys.indexOf(animationID);
        if (animationIndex !== -1) {
          animationKeys.splice(animationID);
        }
        
        if (completion) {
          completion();
        }
    }.bind(this), duration * 1000.0);
    
    gameEngine.addScheduledActionWithKey(function() {
      this._moveTo(startX, startY, startZ, newX, newY, newZ, now, duration);
    }.bind(this), animationID);
  },
  
  _moveTo: function(startX, startY, startZ, endX, endY, endZ, startTime, duration) {
    var xStep = (endX - startX);
    var yStep = (endY - startY);
    
    var now = Date.now();
    var percentage = ((now - startTime) / 1000.0) / duration;
    if (percentage <= 1) {
      this._setPosition(startX + (xStep * percentage), startY + (yStep * percentage), 0.0);
    }
  },
  
  moveBy: function(duration, movePosition, completion) {
//    var position = this._position;
//    
//    var animationKeys = this._animationKeys;
//    var animationID = "_moveBy_" + this._id;
//    animationKeys.push(animationID);
//    
//    var now = Date.now();
//    var gameEngine = GameEngine.sharedEngine;
//    
//    gameEngine.addScheduledActionWithKey(function() {
//      this._moveBy(position, moveToPosition, now, duration);
//    }.bind(this), animationID);
  },
  
  _moveBy: function(startPosition, movePosition, startTime, duration) {
//    var xStep = movePosition.x / duration;
//    var yStep = movePosition.y / duration;
//    
//    var now = Date.now();
//    var elapsedTime = ((now - startTime) / 1000.0);
//    this.setPosition({x: startPosition.x + (xStep * elapsedTime), y: startPosition.y + (yStep * elapsedTime)});
  },
  
  fadeTo: function(duration, newAlpha, completion) {
    if (duration < getInterval() / 1000.0) {
      this.setAlpha(newAlpha);
      setTimeout(completion, duration * 1000.0);
      return;
    }
    
    var alpha = this._alpha;
    
    var animationKeys = this._animationKeys;
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
    var alphaStep = endAlpha - startAlpha;
    
    var now = Date.now();
    var percentage = ((now - startTime) / 1000.0) / duration;
    if (percentage <= 1) {
      this.setAlpha(startAlpha + alphaStep * percentage);
    }
  },
  
  scaleTo: function(duration, newScale, completion) {
    var scale = this._scale;
    var frames = (duration / getInterval() / 1000.0);
    var step = (newScale - scale) / frames;
    
    var animationKeys = this._animationKeys;
    var animationID = "_scaleBy_" + this._id;
    animationKeys.push(animationID);
    
    var gameEngine = GameEngine.sharedEngine;
    gameEngine.addScheduledActionWithKey(function() {
      this._scaleBy(getInterval() / 1000.0, newScale, step, function() {
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
    if (duration < getInterval() / 1000.0) {
      this.setRotation(newRotation);
      setTimeout(completion, duration * 1000.0);
      return;
    }
    
    var rotation = this._rotation;
    
    var animationKeys = this._animationKeys;
    var animationID = "_rotateTo_" + this._id;
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
      this._rotateTo(rotation, (!isNaN(parseFloat(newRotation)) && isFinite(newRotation)) ? {x: 0.0, y: 0.0, z: newRotation} : newRotation, now, duration);
    }.bind(this), animationID);
  },
  
  _rotateTo: function(startDegrees, endDegrees, startTime, duration) {
    var rotationStepX = endDegrees.x - startDegrees.x;
    var rotationStepY = endDegrees.y - startDegrees.y;
    var rotationStepZ = endDegrees.z - startDegrees.z;
    
    var now = Date.now();
    var percentage = ((now - startTime) / 1000.0) / duration;
    if (percentage <= 1.0) {
      this.setRotation({x: startDegrees.x + (rotationStepX * percentage), y: startDegrees.y + (rotationStepY * percentage), z: startDegrees.z + (rotationStepZ * percentage)});
    }
  },
  
  rotateBy: function(duration, newRotation, repeatCount, completion) {
    var rotation = this._rotation;
    
    var animationKeys = this._animationKeys;
    var animationID = "_rotateBy_" + this._id;
    animationKeys.push(animationID);
    
    var now = Date.now();
    var gameEngine = GameEngine.sharedEngine;
    
    gameEngine.addScheduledActionWithKey(function() {
      this._rotateBy(rotation, (!isNaN(parseFloat(newRotation)) && isFinite(newRotation)) ? {x: 0.0, y: 0.0, z: newRotation} : newRotation, now, duration, repeatCount, function() {
        var animationIndex = animationKeys.indexOf(animationID);
        if (animationIndex !== -1) {
          animationKeys.splice(animationID);
        }
        
        if (completion) {
          completion();
        }
      }.bind(this));
    }.bind(this), animationID);
  },
  
  _rotateBy: function(startDegrees, endDegrees, startTime, duration, repeatCount, completion) {
    var rotationStepX = endDegrees.x / duration;
    var rotationStepY = endDegrees.y / duration;
    var rotationStepZ = endDegrees.z / duration;
    
    var now = Date.now();
    var elapsedTime = ((now - startTime) / 1000.0);
    this.setRotation({x: startDegrees.x + (rotationStepX * elapsedTime), y: startDegrees.y + (rotationStepY * elapsedTime), z: startDegrees.z + (rotationStepZ * elapsedTime)});
  
    repeatCount --;
    if (repeatCount === 0) {
      if (completion) {
        completion();
      }
    }
  },
  
  _needsInitialUpdate: false,
  _update: function() {
    this._prepareForRender();
    if (needsUpdate(this)) {
      var scene = this._scene;
      if (scene) {
        scene.dirty = true;
      }
    }
  },
  
  needsScene: function() {
    return true;
  },
  
  _matrix: null,
  updateMatrix: function() {
    this._shouldUpdateMatrix = false;
  
    if (this._shouldRender3D) {
      this.update3DMatrix();
    }
    else {
      if (this.needsScene() && !this._scene) {
        return;
      }
      
      var width = this._width;
      var height = this._height;
      
      // Scale
      var scaleMatrixInfo = this._scaleMatrixInfo;
      var scaleMatrix = scaleMatrixInfo.matrix;
      if (scaleMatrixInfo.shouldUpdate) {
        scaleMatrixInfo.shouldUpdate = false;
        
        var scale = this._scale;
        // * this._yScaleMultiplier
        updateScale(scale, scale, scaleMatrix);
      }
      
      // Rotation
      var rotationMatrixInfo = this._rotationMatrixInfo;
      var rotationMatrix = rotationMatrixInfo.matrix;
      if (rotationMatrixInfo.shouldUpdate) {
        rotationMatrixInfo.shouldUpdate = false;
      
        var angleInDegrees = this._rotation.z;
        var angleInRadians = angleInDegrees * Math.PI / 180;
      
        updateRotation(angleInRadians, rotationMatrix);
      }
      
      // Translation
      var translationMatrixInfo = this._translationMatrixInfo;
      var translationMatrix = translationMatrixInfo.matrix;
      if (translationMatrixInfo.shouldUpdate) {
        translationMatrixInfo.shouldUpdate = false;
        
        //this._yStartTranslation
        updateTranslation(this._x, this._y, translationMatrix);
      }
      
      // Anchor Point
      var originMatrixInfo = this._originMatrixInfo;
      var originMatrix = originMatrixInfo.matrix;
      if (originMatrixInfo.shouldUpdate) {
        originMatrixInfo.shouldUpdate = false;
        
        var anchorPoint = this._anchorPoint;
        updateTranslation(- width * anchorPoint.x, - height * anchorPoint.y, originMatrix);
      }
      
      // Multiply them
      var anchorScaleMatrixInfo = this._anchorScaleMatrixInfo;
      var anchorScaleMatrix = anchorScaleMatrixInfo.matrix;
      if (anchorScaleMatrixInfo.shouldUpdate) {
        anchorScaleMatrixInfo.shouldUpdate = false;
      
        simpleMatrixMultiply(originMatrix, scaleMatrix, anchorScaleMatrix);
      }
      
      var anchorScaleRotationMatrixInfo = this._anchorScaleRotationMatrixInfo;
      var anchorScaleRotationMatrix = anchorScaleRotationMatrixInfo.matrix;
      if (anchorScaleRotationMatrixInfo.shouldUpdate) {
        anchorScaleRotationMatrixInfo.shouldUpdate = false;
      
        simpleMatrixMultiply(anchorScaleMatrix, rotationMatrix, anchorScaleRotationMatrix);
      }
      
      var ownMatrixInfo = this._ownMatrixInfo;
      var ownMatrix = ownMatrixInfo.matrix;
      if (ownMatrixInfo.shouldUpdate) {
        ownMatrixInfo.shouldUpdate = false;
        
        multiplyAnchorScaleMatrixWithRotationMatrix(anchorScaleRotationMatrix, translationMatrix, ownMatrix);
      }
      
      var matrix;
      var parent = this._parent;
      if (parent && parent._matrix && !parent._isScene) {
        matrix = simpleMatrixMultiply(ownMatrix, this._parent._matrix, this._parentMatrix);
      }
      else {
        matrix = ownMatrix;
      }
      
      var points = [];
      points[0] = multiplyPosition(0.0, 0.0, matrix);
      points[1] = points[0];
      points[2] = multiplyPosition(width, 0.0, matrix);
      points[3] = multiplyPosition(width, height, matrix);
      
      var firstPoint = points[0];
      var lowX = firstPoint.x, lowY = firstPoint.y, highX = firstPoint.x, highY = firstPoint.y;
      
      for (var i = 1; i < points.length; i ++) {
        var point = points[i];
        var pointX = point.x;
        var pointY = point.y;
        
        if (pointX < lowX) {
          lowX = pointX;
        }
        
        if (pointY < lowY) {
          lowY = pointY;
        }
        
        if (pointX > highX) {
          highX = pointX;
        }
        
        if (pointY > highY) {
          highY = pointY;
          
        }
      }
      
      var scene = this._scene;
      if (scene) {
        var frame = {x: lowX, y: lowY, width: highX - lowX, height: highY - lowY};
        var sceneFrame = {x: 0.0, y: 0.0, width: scene._width, height: scene._height};
        var isVisible = rectInsideRect(frame, sceneFrame);
        if (this._isVisible !== isVisible) {
          this._isVisible = isVisible;
//          scene._renderList = null;
          this.updateRectangleArray();
          
          if (this instanceof GameEngine.Sprite) {
            var texture = this.image.texture;
            var batchArray = texture.batchArray;
//            console.log("batchArray", batchArray);
            if (batchArray) {
              if (isVisible) {
                var index = batchArray.indexOf(this);
                if (index === -1) {
                  batchArray.push(this);
                  batchArray.changed = true;
                }
              }
              else {
                var index = batchArray.indexOf(this);
                batchArray.splice(index, 1);
                batchArray.changed = true;
                
                if (batchArray.length === 0) {
                  texture.batchArray = null;
                  scene._renderList = null;
                }
              }
            }
          }
          
//          this._update();
        }
      }
      
      var children = this._children;
      for (var i = 0; i < children.length; i ++) {
        var child = children[i];
        child.updateMatrix();
      }
    }
  },
  
  update3DMatrix: function() {
    if (this.needsScene() && !this._scene) {
      return;
    }
    
    var width = this._width;
    var height = this._height;
    
    // Scale
    var scale = this._scale;
    var scaleMatrix = make3DScale(scale, scale, scale);
    //makeScale(scale, scale);
    
    // Rotation
    var rotation = this._rotation;
    
    var angleInDegreesX = rotation.x;
    var angleInRadiansX, rotationMatrixX;
    if (angleInDegreesX !== 0.0) {
      angleInRadiansX = angleInDegreesX * Math.PI / 180;
      rotationMatrixX = make3DRotationX(angleInRadiansX);
    }
    
    var angleInDegreesY = rotation.y;
    var angleInRadiansY, rotationMatrixY;
    if (angleInDegreesY !== 0.0) {
      angleInRadiansY = angleInDegreesY * Math.PI / 180;
      rotationMatrixY = make3DRotationY(angleInRadiansY);
    }
    
    var angleInDegreesZ = rotation.z;
    var angleInRadiansZ, rotationMatrixZ;
    if (angleInDegreesZ !== 0.0) {
      angleInRadiansZ = angleInDegreesZ * Math.PI / 180;
      rotationMatrixZ = make3DRotationZ(angleInRadiansZ);
    }
    
    // Translation
    var translationMatrix = make3DTranslation(this._x, this._y, position.z);
    
    // Multiply them
    var anchorPoint = this.getAnchorPoint();
    var moveOriginMatrix = make3DTranslation(- width * anchorPoint.x, - height * anchorPoint.y, 0.0);
    var matrix = matrix3DMultiply(moveOriginMatrix, scaleMatrix);
    
    matrix = scaleMatrix;
    if (this._parent && this._parent._matrix) {
      var parentMatrix = this._parent._matrix;
      matrix = matrix3DMultiply(this._parent._matrix, scaleMatrix);
    }
    
    matrix = matrix3DMultiply(matrix, translationMatrix);
    
    if (angleInDegreesX !== 0.0) {
      matrix = matrix3DMultiply(matrix, rotationMatrixX);
    }
    
    if (angleInDegreesY !== 0.0) {
      matrix = matrix3DMultiply(matrix, rotationMatrixY);
    }
    
    if (angleInDegreesZ !== 0.0) {
      matrix = matrix3DMultiply(matrix, rotationMatrixZ);
    }
    matrix = matrix3DMultiply(matrix, moveOriginMatrix);
    
    this._matrix = matrix;
    
    var children = this._children;
    for (var i = 0; i < children.length; i ++) {
      var child = children[i];
//    this._children.forEach(function(child) {
      child.updateMatrix();
//    });
    }
  },
  
  _texturePadding: {left: 0.0, bottom: 0.0, right: 0.0, top: 0.0},
  _rectangleArrayChanged: true,
  updateRectangleArray: function() {
//    console.log("updateRectangleArray", updateRectangleArray);
    this._rectangleArrayChanged = true;
    
    var width = this._width;
    var height = this._height;
    
    var texturePadding = this._texturePadding;
    
    var left = texturePadding.left;
    var bottom = texturePadding.bottom;
    var right = texturePadding.right;
    var top = texturePadding.top;
    
    if (this._shouldRender3D) {
      this.rectangleArray = new Float32Array([ 
        left, bottom, 0.0,
        width - right, bottom, 0.0,
        left, height - top, 0.0,
        left, height - top, 0.0,
        width - right, bottom, 0.0,
        width - right, height - top, 0.0]
      );
    }
    else {
      var rectangleArray = this.rectangleArray;
      rectangleArray[0] = left;
      rectangleArray[1] = bottom;
      
      rectangleArray[2] = width - right;
      rectangleArray[3] = bottom;
      
      rectangleArray[4] = left;
      rectangleArray[5] = height - top;
      
      rectangleArray[6] = left;
      rectangleArray[7] = height - top;
      
      rectangleArray[8] = width - right;
      rectangleArray[9] = bottom;
      
      rectangleArray[10] = width - right;
      rectangleArray[11] = height - top;
    }
  },
  
  _prepareForRender: function() {
    if (this._shouldUpdateMatrix) {
      this.updateMatrix();
    }
  },
  
  render: function() {
    this._prepareForRender();
    GameEngine.nodeRenderer.render(this);
//    this._renderer.render(this);
  }

});

function needsUpdate(node) {
  if (node._doesDraw === true && node._isVisible) {
    return true;
  }
  
  var doesDraw = false;
  var children = node._children;
  for (var i = 0; i < children.length; i ++) {
    var child = children[i];
//  node._children.forEach(function(child) {
    if (child._doesDraw && node._isVisible) {
      doesDraw = true;
    }
//  });
  }
  
  return doesDraw;
}