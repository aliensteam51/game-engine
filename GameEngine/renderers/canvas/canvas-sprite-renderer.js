GameEngine.CanvasSpriteRenderer = GameEngine.CanvasRenderer.extend({
  render: function(sprite) {
    var image = sprite.image;
    if (!image)		{
      return;
    }
	
    var canvas = getCanvas();
    var context = canvas.getContext('2d');
    
    // Store the current transformation matrix
    context.save();
    
    var matrix = sprite._matrix;
    context.setTransform(matrix[0], matrix[1], matrix[3], matrix[4], matrix[6], matrix[7]);
    
    context.globalAlpha = sprite._alpha;
    
    var texturePadding = sprite._texturePadding;
    var contentSize = sprite.getContentSize();
    var textureFrame = sprite.textureFrame;
    
    if (textureFrame) {
      context.drawImage(image, textureFrame.x, textureFrame.y, textureFrame.width, textureFrame.height, texturePadding.left, texturePadding.top, contentSize.width - texturePadding.left - texturePadding.right, contentSize.height - texturePadding.top - texturePadding.bottom);
    }
    else {
      context.drawImage(image, texturePadding.left, texturePadding.top, contentSize.width - texturePadding.left - texturePadding.right, contentSize.height - texturePadding.top - texturePadding.bottom);
    }
    
    // Restore the transform
    context.restore();
  }
});