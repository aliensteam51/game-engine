# AlienEngine

![Penguin](https://raw.githubusercontent.com/aliensteam51/game-engine/master/Images/Beer.png)

In short **AlienEngine** is a web game engine focussed on performance!

## History

It all began when I worked on different projects with different web game engines. These projects required the games to work on both desktop computers and mobile devices. I noticed that the game engines we used, required a lot of processor power, even when showing a still image! So I deciced to make an own game engine which doesn't render when nothing changes. So **AlienEngine** was born.

## Goals

- Only render when something when something changes (**implemented**)
- Don't render objects that are out of scene bounds (**partly implemented**)
- Automaticly render simple sprites that use the same texture in batch (glDrawElements, **implemented**)
- Implement basic game engine features (**partly implemented**)
- Implement advanced game engine features (**not implemented yet**)
- Automatically switch shader programs based on the current needs of an node/sprite (**partly implemented**)

## Code Syntax

The code syntax used in **AlienEngine** is based on other engines like Cocos2D (X, Mac/iOS) and SpriteKit (Mac/iOS). The example below comes straight out of one of the examples included here on the repository:

```javascript
function main() {
  preloadFiles(["../00-assets/images/Dance_of_Rebirth_by_shiroikuro.jpg"], function() {
    var contentSize = {width: 800.0, height: 600.0};
  
    var scene = new AlienEngine.Scene({width: contentSize.width, height: contentSize.height});
    var sprite = new AlienEngine.Sprite("../00-assets/images/Dance_of_Rebirth_by_shiroikuro.jpg");
    var spriteSize = sprite.getContentSize();
    sprite.setAnchorPoint({x: 0.0, y: 0.0});
    sprite.setPosition({x: 0.0, y: contentSize.height - spriteSize.height});
    scene.addChild(sprite);
    AlienEngine.sharedEngine.start();
    AlienEngine.sharedEngine.presentScene(scene);
  });
}
```
## Other Engines

**AlienEngine** is currently focussing on performance above features, it's also in alpha state right now. It's always important to compare different engines when choosing one!!! :-)

|Engine|Website|
|------|-------|
|Cocos2D|[http://www.cocos2d-x.org](http://www.cocos2d-x.org)|
|Phaser|[http://phaser.io](http://phaser.io)|
|Pixi|[http://www.pixijs.com](http://www.pixijs.com)|
|MelonJS|[http://melonjs.org](http://melonjs.org)|
