function main() {
  preloadFiles(["../00-assets/images/Dance_of_Rebirth_by_shiroikuro.jpg"], function() {
    var contentSize = {width: 800.0, height: 600.0};
  
    var scene = new GameEngine.Scene({width: contentSize.width, height: contentSize.height});
    var sprite = new GameEngine.Sprite("../00-assets/images/Dance_of_Rebirth_by_shiroikuro.jpg");
    var spriteSize = sprite.getContentSize();
    sprite.setAnchorPoint({x: 0.0, y: 0.0});
    sprite.setPosition({x: 0.0, y: contentSize.height - spriteSize.height});
    scene.addChild(sprite);
    GameEngine.sharedEngine.start();
    GameEngine.sharedEngine.presentScene(scene);
  });
}