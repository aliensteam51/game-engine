GameEngine.Scene = GameEngine.Object.extend({
  className: "GameEngine.Scene",
  backgroundColor: {r: 126.0 / 255.0, g: 211.0 / 255.0, b: 33.0 / 255.0, a: 1.0},

  /**
   *  @property {Array} children
   *  @description The scenes children
   */
  children: null,
  
  /** 
   *  @property {Boolean} dirty 
   *  @description If the sprite should redraw or not 
   */
  dirty: true,
  
  init: function() {
    this._super();
    this.children = [];
    
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
  
  addChild: function(child) {
    if (!child instanceof GameEngine.Node) {
      console.log("GameEngine.Scene - addChild: child is not a node or node subclass");
      return;
    }
    
    this.children.push(child);
    child._setScene(this);
    child._update();
  },
  
  allChildren: function() {
    var children = [];
    
    this.children.forEach(function(child) {
      children.push(child);
      this.getNodeChildren(child, children);
    }.bind(this));
    
    return children.sort(function(node1, node2) {
      return node1.zIndex - node2.zIndex;
    });;
  },
  
  getNodeChildren: function(node, array) {
    node._children.forEach(function(child) {
      array.push(child);
      this.getNodeChildren(child);
    }.bind(this));
  },
  
  onTouchBegan: function(event) {
  },
  
  
  onTouchMoved: function(event) {
  },
  
  onTouchEnded: function(event) {
  },
});