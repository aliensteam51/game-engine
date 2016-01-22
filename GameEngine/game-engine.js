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
    
    if (this.legacyCanvasMode && GameEngine.Transition.Cube) {
      transition = GameEngine.Transition.None;
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
//          scene.setPosition({x: 0.0, y: 0.0});
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
  
  render: function() {
    var currentScene = this.currentScene;
    if (currentScene && currentScene.dirty) {
      currentScene.dirty = false;
      
      var renderScenes = this.otherScenes.slice();
      renderScenes.push(currentScene);
      
      GameEngine.sharedRenderManager.render(renderScenes);
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