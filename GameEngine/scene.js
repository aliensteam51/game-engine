GameEngine.Scene = GameEngine.Node.extend({
  _className: "GameEngine.Scene",
  
  /** 
   *  @property {Boolean} dirty 
   *  @description If the sprite should redraw or not 
   */
  dirty: true,
  
  init: function(contentSize) {
    this._anchorPoint = {x: 0.0, y: 0.0};
  
    this._super(contentSize);
    
    var gameEngine = GameEngine.sharedEngine;
    gameEngine.addScheduledActionWithKey(function() {
      this.update();
    }.bind(this), this._id + "_update");
  },
  
  update: function() {
    
  },
  
  onEnter: function() {
  
  },
  
  onExit: function() {
  
  },
  
  sceneTransitionTo: function(completion) {
    
  },
  
  sceneTransitionFrom: function(completion) {
  
  },
  
  needsScene: function() {
    return false;
  },
  
  addChild: function(child) {
    this._super(child);
    child._setScene(this);
    this._renderList = null;
    this._update();
  },
  
  allChildren: function() {
    var children = [];
    
    this._children.forEach(function(child) {
      children.push(child);
      this.getNodeChildren(child, children);
    }.bind(this));
    
    return children.sort(function(node1, node2) {
      return node1.zIndex - node2.zIndex;
    });
  },
  
  _update: function() {
    this.dirty = true;
  },
  
  getNodeChildren: function(node, array) {
    node._children.forEach(function(child) {
      array.push(child);
      this.getNodeChildren(child, array);
    }.bind(this));
  },
});