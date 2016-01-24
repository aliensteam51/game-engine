GameEngine.nodeRenderer;
GameEngine.spriteRenderer;
GameEngine.colourNodeRenderer;
GameEngine.batchNodeRenderer;
GameEngine.batchSpriteRenderer;
GameEngine.batchColourNodeRenderer;

GameEngine.renderers;

GameEngine.RenderManager = GameEngine.Object.extend({
  init: function() {
    this._super();
  },
  
  setup: function(completion) {
    if (!GameEngine.sharedEngine.legacyCanvasMode) {
      this.setupGL(completion);
    }
    else {
      this.setupCanvas(completion);
    }
  },
  
  setupGL: function(completion) {
    GameEngine.nodeRenderer = new GameEngine.GLNodeRenderer;
    GameEngine.spriteRenderer = new GameEngine.GLSpriteRenderer;
    GameEngine.colourNodeRenderer = new GameEngine.GLColourNodeRenderer;
    GameEngine.batchNodeRenderer = new GameEngine.GLBatchNodeRenderer;
    GameEngine.batchSpriteRenderer = new GameEngine.GLBatchSpriteRenderer;
    GameEngine.batchColourNodeRenderer = new GameEngine.GLBatchColourNodeRenderer;
    
    GameEngine.renderers = [GameEngine.nodeRenderer, GameEngine.spriteRenderer, 
                            GameEngine.colourNodeRenderer, GameEngine.batchNodeRenderer,
                            GameEngine.batchSpriteRenderer, GameEngine.batchColourNodeRenderer];
    
    this.loadPrograms(completion);
  },
  
  setupCanvas: function(completion) {
    GameEngine.nodeRenderer = new GameEngine.CanvasNodeRenderer;
    GameEngine.spriteRenderer = new GameEngine.CanvasSpriteRenderer;
    GameEngine.colourNodeRenderer = new GameEngine.CanvasColourNodeRenderer;
    
    GameEngine.renderers = [GameEngine.nodeRenderer, GameEngine.spriteRenderer, 
                            GameEngine.colourNodeRenderer];
                            
    if (completion) {
      completion();
    }
  },
  
  loadPrograms: function(completion) {
    var renderers = GameEngine.renderers;
    var renderersCount = renderers.length;
    var completionFunction = function() {
      renderersCount --;
      if (renderersCount === 0) {
        if (completion) {
          completion();
        }
      }
    };
    
    for (var i = 0; i < renderers.length; i ++) {
      var renderer = renderers[i];
      renderer.loadPrograms(completionFunction);
    }
  },
  
  render: function(scenes) {
    if (!GameEngine.sharedEngine.legacyCanvasMode) {
      this.renderGL(scenes);
    }
    else {
      this.renderCanvas(scenes);
    }
  },
  
  renderGL: function(scenes) {
    var gl = getGL();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);      // Clear the color as well as the depth buffer.
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    
    for (var y = 0; y < scenes.length; y ++) {
      var scene = scenes[y];
      if (scene) {
        var children = scene._getRenderList();
        
        for (var i = 0; i < children.length; i ++) {
          var child = children[i];
          if (child instanceof Array) {
            //TMP, add to batch
            GameEngine.batchSpriteRenderer.render(child);
          }
          else {
            child.render();
          }
        }
      }
    }
    
    gl.flush();
  },
  
  renderCanvas: function(scenes) {
    var canvas = getCanvas();
    var context = canvas.getContext('2d');
    
    // Store the current transformation matrix
    context.save();

    // Use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the transform
    context.restore();
    
    for (var x = 0; x < scenes.length; x ++) {
      var scene = scenes[x];
//      var backgroundColor = scene.backgroundColor;
      context.fillStyle = "rgba(0.0, 0.0, 0.0, 0.0)";
      //"rgba(" + backgroundColor.r * 255.0 + ", " + backgroundColor.g * 255.0 + ", " + backgroundColor.b * 255.0 + ", " + backgroundColor.a + ")";
      context.fillRect(0.0, 0.0, canvas.width, canvas.height);
      
      var children = scene._getRenderList();
      for (var i = 0; i < children.length; i ++) {
        var child = children[i];
        if (child instanceof Array) {
          for (y = 0; y < child.length; y ++) {
            var subChild = child[y];
            subChild.render();
          }
        }
        else {
          child.render();
        }
      }
    }
  },
});
GameEngine.sharedRenderManager = new GameEngine.RenderManager();