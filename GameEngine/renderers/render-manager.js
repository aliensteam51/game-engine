var renderers = [GameEngine.nodeRenderer, GameEngine.spriteRenderer, GameEngine.colourNodeRenderer, GameEngine.batchNodeRenderer, GameEngine.batchSpriteRenderer, GameEngine.batchColourNodeRenderer];
GameEngine.RenderManager = GameEngine.Object.extend({
  init: function() {
    this._super();
  },
  
  loadPrograms: function(completion) {
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
//    renderers.forEach(function(renderer) {
      renderer.loadPrograms(completionFunction);
//    });
    }
  },
  
  render: function(scenes) {
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
            child[0]._batchRenderer.render(child);
          }
          else {
            child.render();
          }
        }
      }
    }
    
    gl.flush();
  }
});
GameEngine.sharedRenderManager = new GameEngine.RenderManager();