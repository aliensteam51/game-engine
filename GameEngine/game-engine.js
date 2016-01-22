GameEngine.Transition = {
  None: 0,
  Custom: 1,
  Cube: 2
};

GameEngine.SharedEngine = GameEngine.Object.extend({
  currentScene: null,
  otherScenes: null,
  legacyCanvasMode: false,
  scheduledActions: null,
  
  init: function() {
    this._super();
    this.scheduledActions = {};
    this.otherScenes = [];
  },
  
  start: function(completion) {
    this.setup();
    this.startEvents();
    
    GameEngine.sharedRenderManager.setup(function() {
      startDrawLoop();
    
      if (completion) {
        completion();
      }
    });
  },

  presentScene: function(scene, transition) {
    if (!scene instanceof GameEngine.Scene) {
      console.log("GameEngine.SharedEngine - presentScene: Scene is not a (subclass of) GameEngine.Scene");
      return;
    }
    
    var otherScenes = this.otherScenes;
    var previousScene = this.currentScene;
    if (previousScene) {
      otherScenes.push(previousScene);
    }
    
    var loadSprites = [];
    
    var sceneChildren = scene._children;
    for (var y = 0; y < sceneChildren.length; y ++) {
      var sceneChild = sceneChildren[y];
//    scene._children.forEach(function(child) {
      if (!sceneChild.loaded) {
        loadSprites.push(sceneChild);
      }
      var children = sceneChild._children;
      for (var i = 0; i < children.length; i ++) {
      var child = children[i];
//      sceneChild._children.forEach(function(subchild) {
        if (!child.loaded) {
          loadSprites.push(child);
        }
//      });
      }
//    });
    }
    
    var loadCount = loadSprites.length;
    loadCount = 0;
    var loadFunction = function(sprite) {
      if (sprite) {
        sprite._testLoadCallback = null;
      }
    
      loadCount--;
      if (loadCount === 0) {
        if (previousScene && transition === GameEngine.Transition.Cube) {
          var contentSize = previousScene.getContentSize();
          previousScene.setAnchorPoint({x: 1.0, y: 0.0});
          previousScene.setPosition({x: 1024.0, y: 0.0});
          previousScene.rotateTo(1.0, {x: 0.0, y: -90.0, z: 0.0});
          previousScene.moveTo(1.0, {x: 0.0, y: 0.0});
        }
      
        this.currentScene = scene;
        scene.dirty = true;
//        scene.onEnter();
        if (previousScene && transition === GameEngine.Transition.Cube) {
          scene.setPosition({x: 1024.0, y: 0.0});
          scene.setRotation({x: 0.0, y: -90.0, z: 0.0});
          scene.rotateTo(1.0, {x: 0.0, y: 0.0, z: 0.0});
          scene.moveTo(1.0, {x: 0.0, y: 0.0});
        }
        else if (transition === GameEngine.Transition.Custom) {
          if (previousScene) {
            var completionCount = 2;
            var completionFunction = function() {
              completionCount --;
              if (completionCount === 0) {
                scene.onEnter();
                var index = otherScenes.indexOf(previousScene);
                if (index !== -1) {
                  otherScenes.splice(index, 1);
                }
                previousScene.onExit();
              }
            };
          
            previousScene.sceneTransitionFrom(function() {
              completionFunction();
            });
            
            scene.sceneTransitionTo(function() {
              completionFunction();
            });
          }
        }
        else {
          scene.setPosition({x: 0.0, y: 0.0});
          scene.onEnter();
          
          if (previousScene) {
            var index = otherScenes.indexOf(previousScene);
            if (index !== -1) {
              otherScenes.splice(index, 1);
            }
            previousScene.onExit();
          }
        }
//        scene.moveTo(0.5, {x: 0.0, y: 0.0});
//        this.otherScenes.push(scene);
      }
    }.bind(this);
    
    if (loadCount === 0) {
      loadCount ++;
      
      loadFunction();
    }
    
    for (var i = 0; i < loadSprites.length; i ++) {
      var loadSprite = loadSprites[i];
//    loadSprites.forEach(function(loadSprite) {
      if (!loadSprite.loaded) {
        loadSprite._testLoadCallback = function() {
          loadFunction(loadSprite);
        };
      }
      else {
        loadFunction(null);
      }
//    }.bind(this));
    }
  },

  startEvents: function() {
    var insideNodes = [];
    var foundNode;
    var canvas = getCanvas();
    
    // Handle mouse down event
    canvas.onmousedown = throttle(function(event) {
      var currentScene = this.currentScene;
      if (currentScene) {
        currentScene.onTouchBegan(event);
        
        var renderList = currentScene._getRenderList();
        for (var i = 0; i < renderList.length; i ++) {
          var node = renderList[i];
//        currentScene._getRenderList().forEach(function(node) {
          if (!node._touchEnabled) {
            continue;
          }

          var position = node.positionInScene();
          var contentSize = node._contentSize;
          var anchorPoint = node._anchorPoint;
          position.x -= contentSize.width * anchorPoint.x;
          position.y -= contentSize.height * anchorPoint.y;
          
          var rect = {x: position.x, y: position.y, width: contentSize.width, height: contentSize.height};
          var inside = rectContainsPoint(rect, getEventPosition(event));
          if (inside) {
            if (node.onTouchBegan(event)) {
              foundNode = node;
              break;
            }
          }
//        });
        }
      }
    }.bind(this), 1.0 / 30.0);
    
    // Handle mouse move event
    canvas.onmousemove = throttle(function(event) {
      var currentScene = this.currentScene;
      if (currentScene) {
        var allChildren = currentScene.allChildren();
        for (var i = 0; i < allChildren.length; i ++) {
          var node = allChildren[i];
//        currentScene.allChildren().forEach(function(node) {
          var nodeIndex = insideNodes.indexOf(node);
          if (nodeIndex === -1 && isEventInsideNode(event, node)) {
            insideNodes.push(node);
            node.onMouseEnter(event);
          }
          else if (nodeIndex !== -1 && !isEventInsideNode(event, node)) {
            insideNodes.splice(nodeIndex, 1);
            node.onMouseExit(event);
          }
//        });
        }
        
        if (foundNode) {
          foundNode.onTouchMoved(event);
        }
      }
    }.bind(this), 1.0 / 30.0);
    
    // Handle mouse up event
    canvas.onmouseup = throttle(function(event) {
      var currentScene = this.currentScene;
      if (currentScene) {
        currentScene.onTouchEnded(event);
      }
    
      if (foundNode) {
        foundNode.onTouchEnded(event);
        foundNode = null;
      }
    }.bind(this), 1.0 / 30.0);
    
    // Handle touch event
    canvas.addEventListener("touchstart", function(event) {
      event.clientX = event.touches[0].clientX;
      event.clientY = event.touches[0].clientY;
      event.preventDefault();
      canvas.onmousedown(event);
    }, false);
    
    // Handle touch move event
    canvas.addEventListener("touchmove", function(event) {
      event.clientX = event.touches[0].clientX;
      event.clientY = event.touches[0].clientY;
      event.preventDefault();
      canvas.onmousemove(event);
    }, false);
    
    // Handle touch end event
    canvas.addEventListener("touchend", function(event) {
      event.preventDefault();
      canvas.onmouseup(event);
    }, false);
    
    
  },

  setup: function() {
    if (!this.legacyCanvasMode) {
      this.setupGL();
    }
  },

  setupGL: function() {
    var gl = getGL();
//    gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
//    gl.depthFunc(gl.ALWAYS);                                // Near things obscure far things
//      gl.depthFunc(gl.NEVER);
      
      //TMP
      this.indexBuffer = gl.createBuffer();
      this.dynamicBuffer = gl.createBuffer();
  },
  
  render: function() {
    var currentScene = this.currentScene;
    if (currentScene && currentScene.dirty) {
      currentScene.dirty = false;
      
      if (this.legacyCanvasMode) {
        this.renderCanvas();
      }
      else {
        var renderScenes = this.otherScenes.slice();
        renderScenes.push(currentScene);
        
        GameEngine.sharedRenderManager.render(renderScenes);
      }
    }
  },

  renderGL: function() {
    var gl = getGL();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);      // Clear the color as well as the depth buffer.
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  
    var currentScene = this.currentScene;
    if (currentScene) {
      var children = currentScene._getRenderList();
      for (var i = 0; i < children.length; i ++) {
        var node = children[i];
//      children.forEach(function(node) {
        if (node instanceof Array) {
        
        }
        else {
          node.render();
          node.draw();
        }
//      });
      }
    }
    
    var otherScenes = this.otherScenes;
    for (var i = 0; i < otherScenes.length; i ++) {
      var scene = otherScenes[i];
//    this.otherScenes.forEach(function(scene) {
      var children = scene._getRenderList();
      for (var i = 0; i < children.length; i ++) {
        var node = children[i];
//      children.forEach(function(node) {
        if (node instanceof Array) {
        
        }
        else {
          node.render();
          node.draw();
        }
//      });
      }
//    });
    }
  
    gl.flush();
  },
  
  // Buffer Render
//  renderGL: function() {
//    var gl = getGL();
//    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);      // Clear the color as well as the depth buffer.
//    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
//  
//    var currentScene = this.currentScene;
//    if (currentScene) {
//      var backgroundColor = currentScene.backgroundColor;
//      gl.clearColor(backgroundColor.r, backgroundColor.g, backgroundColor.b, backgroundColor.a);
//      
//      var firstSprite = currentScene.children[0];
//      firstSprite.clara(currentScene.children.length);
//      
//      if (!firstSprite.program) {
//        return;
//      }
//      
//      var dynamicData = new Float32Array(currentScene.children.length * 8);
//      var rectangleArray = new Float32Array(currentScene.children.length * 12);
//      for (var i = 0; i < currentScene.children.length; i ++) {
//        var sprite = currentScene.children[i];
//        var index = i + i * 7;
//        
//        var position = sprite._position;
//        dynamicData[index] = position.x;
//        dynamicData[index + 1] = position.y;
//        
//        dynamicData[index + 2] = position.x;
//        dynamicData[index + 3] = position.y;
//        
//        dynamicData[index + 4] = position.x;
//        dynamicData[index + 5] = position.y;
//        
//        dynamicData[index + 6] = position.x;
//        dynamicData[index + 7] = position.y;
//        
//        
//        var contentSize = sprite._contentSize;
//        
//        var index2 = i + i * 11;
//        rectangleArray[index2] = 0.0;
//        rectangleArray[index2 + 1] = contentSize.width;
//        rectangleArray[index2 + 2] = 0.0;
//        
//        rectangleArray[index2 + 3] = contentSize.width;
//        rectangleArray[index2 + 4] = contentSize.height;
//        rectangleArray[index2 + 5] = 0.0;
//        
//        rectangleArray[index2 + 6] = 0.0;
//        rectangleArray[index2 + 7] = 0.0;
//        rectangleArray[index2 + 8] = 0.0;
//        
//        rectangleArray[index2 + 9] = contentSize.width;
//        rectangleArray[index2 + 10] = 0.0;
//        rectangleArray[index2 + 11] = 0.0;
//      }
//      
//      gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
//      gl.bufferData(gl.ARRAY_BUFFER, dynamicData, gl.STATIC_DRAW);
//      gl.enableVertexAttribArray(firstSprite.program.translationLocation);
//      gl.vertexAttribPointer(firstSprite.program.translationLocation, 2, gl.FLOAT, false, 0, 0);
//
//      // Create a buffer and put a single clipspace rectangle in it (2 triangles)
//      gl.bindBuffer(gl.ARRAY_BUFFER, firstSprite.program.buffer);
//      
//      // setup the rectangle
//      gl.bufferData(gl.ARRAY_BUFFER, rectangleArray, gl.STATIC_DRAW);
//      gl.enableVertexAttribArray(firstSprite.program.positionLocation);
//      gl.vertexAttribPointer(firstSprite.program.positionLocation, 3, gl.FLOAT, false, 0, 0);
//      
//      var indices = new Uint16Array(98304);
//      for (var i=0, j=0; i < currentScene.children.length * 6; i += 6, j += 4)
//      {
//          indices[i + 0] = j + 0;
//          indices[i + 1] = j + 2;
//          indices[i + 2] = j + 3;
//          indices[i + 3] = j + 0;
//          indices[i + 4] = j + 3;
//          indices[i + 5] = j + 1;
//      }
//      
//      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
//      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
//      
//      gl.drawElements(gl.TRIANGLES, currentScene.children.length * 6, gl.UNSIGNED_SHORT, 0);
//      
////      // Sort opaque, not opaque
////      var children = currentScene.children;
////      var sortedChildren = children.sort(function(node1, node2) {
////        return  node1.zIndex - node2.zIndex;
////      });
////      sortedChildren.forEach(function(node) {
////        node.render();
////        node.draw();
////      });
//    }
//  
//    gl.flush();
//  },

  renderCanvas: function() {
    var canvas = getCanvas();
    var context = canvas.getContext('2d');
    
    console.log("CANVAS", canvas, context);
    if (!context) {
      return;
    }
    
    // Store the current transformation matrix
    context.save();

    // Use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the transform
    context.restore();
    
    var currentScene = this.currentScene;
    if (currentScene) {
      var backgroundColor = currentScene.backgroundColor;
      context.fillStyle = "rgba(" + backgroundColor.r * 255.0 + ", " + backgroundColor.g * 255.0 + ", " + backgroundColor.b * 255.0 + ", " + backgroundColor.a + ")";
      context.fillRect(0.0, 0.0, canvas.width, canvas.height);
      
      var allChildren = currentScene.allChildren;
      for (var i = 0; i < allChildren.length; i ++) {
        var node = allChildren[i];
//      currentScene.allChildren().forEach(function(node) {
        node.renderForCanvas();
//      });
      }
    }
  },
  
  addScheduledActionWithKey: function(action, key) {
    this.scheduledActions[key] = action;
  },
  
  removeScheduledActionWithKey: function(key) {
    delete this.scheduledActions[key];
  },
  
  performScheduledActions: function() {
    var scheduledActions = this.scheduledActions;
    for (var actionKey in scheduledActions) {
      if (actionKey) {
        scheduledActions[actionKey]();
      }
    }
  },
  
  intervalActionKeys: [],
  performActionWithKeyAtInterval: function(action, key, interval) {
    var actionLoop = function() {
      if (this.intervalActionKeys.indexOf(key) === -1) {
        return;
      }
      
      var requestId = requestAnimationFrame(actionLoop);
      
      var now = Date.now();
      var delta = now - then;
      if (delta > interval) {
        then = now - (delta % interval);
        if (action) {
          action();
        }
      }
    }.bind(this);
    this.intervalActionKeys.push(key);
    actionLoop();
  },
  removeIntervalActionKey: function(key) {
    var index = this.intervalActionKeys.indexOf(key);
    if (index !== -1) {
      this.intervalActionKeys.splice(index, 1);
    }
  }
});
GameEngine.sharedEngine = new GameEngine.SharedEngine;

var isDrawing = false;
function startDrawLoop() {
  // Only start the draw loop if not started yet
  if (!isDrawing) {
    doDrawLoop();
  }
}

var interval = 1000.0 / 60.0; // based on frame rate
function changeInterval(newInterval) {
  interval = newInterval;
}
function getInterval() {
  return interval;
}

var then = Date.now();
function doDrawLoop() {
  var requestId = requestAnimationFrame(doDrawLoop);
   
  var now = Date.now();
  var delta = now - then;

  if (delta > interval) {
    then = now - (delta % interval);
    var gameEngine = GameEngine.sharedEngine;
    gameEngine.performScheduledActions();
    gameEngine.render();
  }
}

var frames = 0;
function testDraw() {
  setTimeout(function() {
    var gameEngine = GameEngine.sharedEngine;
    gameEngine.performScheduledActions();
    gameEngine.render();
    frames ++;
    testDraw();
  }, 0);
}

function isEventInsideNode(event, node) {
  var position = node.getPosition();
  var contentSize = node._contentSize;
  var anchorPoint = node._anchorPoint;
  position.x -= contentSize.width * anchorPoint.x;
  position.y -= contentSize.height * anchorPoint.y;
  
  var rect = {x: position.x, y: position.y, width: contentSize.width, height: contentSize.height};
  return rectContainsPoint(rect, getEventPosition(event));
}