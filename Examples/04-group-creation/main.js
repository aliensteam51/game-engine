function main() {
  preloadFiles([  "../00-assets/images/Public.png", 
                  "../00-assets/images/Background.png", 
                  "../00-assets/images/BirdSheet.json", 
                  "../00-assets/images/BirdSheet.png"], function() {
    var contentSize = {width: 800.0, height: 600.0};
  
    var scene = new GameEngine.Scene({width: contentSize.width, height: contentSize.height});
    
    var backgroundSprite = new GameEngine.Sprite("../00-assets/images/Background.png");
    backgroundSprite.setPosition({x: contentSize.width / 2.0, y: contentSize.height / 2.0});
    scene.addChild(backgroundSprite);
    
    var publicSprite = new GameEngine.Sprite("../00-assets/images/Public.png");
    var publicSpriteSize = publicSprite.getContentSize();
    publicSprite.setZIndex(100);
    publicSprite.setPosition({x: contentSize.width / 2.0, y: publicSpriteSize.height / 2.0});
    scene.addChild(publicSprite);
    moveSlowly(publicSprite);
    
    var imageNames = [];
    for (var i = 1; i < 5; i ++) {
      imageNames.push("frame-" + i + ".png");
    }
    
    for (var i = 0; i < 6; i ++) {
      var position = {x: 120.0 * i, y: 100.0 + (Math.random() * 300.0)};
      var birdSprite = new GameEngine.Sprite();
      birdSprite.setAtlas("../00-assets/images/BirdSheet.png", "../00-assets/images/BirdSheet.json", "frame-1.png");
      birdSprite.setAnchorPoint({x: 0.0, y: 0.0});
      birdSprite.setPosition(position);
      scene.addChild(birdSprite);
      
      var position1 = {x: position.x + contentSize.width, y: position.y - Math.random() * 200.0};
      var position2 = {x: position.x, y: position.y + Math.random() * 200.0};
      var position3 = position;
      
      birdSprite.startFrameAnimation(imageNames, 1.0 / 24, 1);
      move(birdSprite, position1, position2, position3);
    }
    
    
    GameEngine.sharedEngine.start();
    GameEngine.sharedEngine.presentScene(scene);
  });
}

function move(sprite, position1, position2, position3) {
  sprite.moveTo(1.0, position1, function() {
    sprite.setPosition({x: -100.0, y: 100.0 + (Math.random() * 300.0)});
    sprite.moveTo(1.0, position2, function() {
      sprite.moveTo(1.0, position3, function() {
        move(sprite, position1, position2, position3);
      });
    });
  });
}

function moveSlowly(sprite) {
  var origPosition = sprite.getPosition();
  var newPosition = {x: origPosition.x, y: origPosition.y + Math.random() * - 30.0};
  sprite.moveTo(0.5, newPosition, function() {
    sprite.moveTo(0.5, origPosition, function() {
      moveSlowly(sprite);
    });
  });
}

//function pad(number, size) {
//    var string = "000000000" + number;
//    return string.substr(string.length - size);
//}