function main() {
  preloadFiles(["../00-assets/images/Penguin.png"], function() {
    var contentSize = {width: 800.0, height: 600.0};
  
    var scene = new GameEngine.Scene({width: contentSize.width, height: contentSize.height});
    
    for (var i = 0.1; i < 2; i += 0.1)
    {
        var wabbit = new MonsterBunny(i);
        wabbit.setPosition({x: Math.random() * contentSize.width, y: Math.random() * contentSize.height});
        scene.addChild(wabbit);
    }

    GameEngine.sharedEngine.start();
    GameEngine.sharedEngine.presentScene(scene);
  });
}

var MonsterBunny = GameEngine.Sprite.extend({
  init: function(speed) {
    this._super("../00-assets/images/Penguin.png");
    
    this.setScale(0.1 + Math.random());
    this.rotateBy(1.0 / 60.0, speed);
  }
});