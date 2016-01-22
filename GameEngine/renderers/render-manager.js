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
    
  },
});
GameEngine.sharedRenderManager = new GameEngine.RenderManager();