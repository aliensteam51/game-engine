var scene;
var timer = 0;
var total = 0;
var contentSize = {width: 800.0, height: 600.0};
var imageNames = [];

var CustomScene = GameEngine.Scene.extend({
  update: function() {
    if (total < 200 && Date.now() > timer) {
      releaseMummy();
    }
  }
});

function main() {
  preloadFiles([  "../00-assets/images/Zombie.json", 
                  "../00-assets/images/Zombie.png"], function() {
  
    scene = new CustomScene({width: contentSize.width, height: contentSize.height});
    
    for (var i = 1; i < 11; i ++) {
      imageNames.push("go_" + i + ".png");
    }
    
    GameEngine.sharedEngine.start(function() {
      releaseMummy();
    });
    GameEngine.sharedEngine.presentScene(scene);
  });
}

function releaseMummy() {
  var mummy = new GameEngine.Sprite();
  mummy.setAtlas("../00-assets/images/Zombie.png", "../00-assets/images/Zombie.json", "go_1.png");
  var position = {x: -(Math.random() * 800), y: Math.random() * contentSize.height};
  mummy.setPosition(position);
  mummy.setRotation(Math.random() * 360.0);
  mummy.setScale(2.0);
  mummy.startFrameAnimation(imageNames, 1.0 / 20.0, 1);
  mummy.moveTo(20.0, {x: contentSize.width + (1600 + position.x), y: position.y});
  scene.addChild(mummy);
  
  total++;
  timer = Date.now() + 100;
}

function pad(number, size) {
    var string = "000000000" + number;
    return string.substr(string.length - size);
}