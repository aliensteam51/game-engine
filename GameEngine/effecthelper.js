/**
 * EffectHelper wraps static functions to create processed image variants.
 *
 * @namespace GameEngine
 * @class EffectHelper
 */
GameEngine.EffectHelper = GameEngine.Object.extend({

  rgbaFromColor : function(color) {
    return 'rgba('+color.r+','+color.g+','+color.b+','+color.a+')';
  },
  
  getTextImage: function(text, textColor, fontSize, size) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    
    context.font = 'normal ' + fontSize + 'px sans-serif'; 
    context.textBaseline = 'middle'; 
    
    var textSize = context.measureText(text);
    
    canvas.width = textSize.width;
    canvas.height = size.height;

    context.font = 'normal ' + fontSize + 'px sans-serif'; 
    context.textBaseline = 'middle'; 
    
//    context.fillStyle = 'rgba(1.0, 0.0, 0.0, 0.0)';
//    context.fillRect(0.0, 0.0, canvas.width, canvas.height);
	
    context.fillStyle = this.rgbaFromColor(textColor);
    context.fillText(text, 0.0, size.height / 2.0);

    return canvas.toDataURL();
    
//    var badBrowser = /iPad|iPhone|iPod/.test(navigator.platform) || navigator.userAgent.indexOf('MSIE') != -1 || navigator.userAgent.indexOf('Trident') != -1;
//    if (badBrowser) {
//      
//    }
    
//    var margins = this.getMargins(context, {width: canvas.width, height: canvas.height});
//    
//    var canvas2 = document.createElement('canvas');
//    var context2 = canvas2.getContext('2d');
//    canvas2.width = canvas.width - (margins.left + margins.right);
//    canvas2.height = canvas.height; 
//    context2.drawImage(canvas, margins.left, 0.0, canvas.width, canvas2.height, 0.0, 0.0, canvas.width, canvas2.height);
//    
//    return canvas2.toDataURL();
  },

  getShadowImage : function(canvasElementsOrImageNames, shadowOffset, shadowBlur, shadowColor, infoDictionary) {
    var IMAGE_MARGIN = 10;

    // First the image data of the combined images
    var imageCanvas = this.combinedImageCanvas(canvasElementsOrImageNames);

    //setup canvas and source image
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    //setup canvas size
    canvas.width = imageCanvas.width + (IMAGE_MARGIN * 2);
    canvas.height = imageCanvas.height + (IMAGE_MARGIN * 2);

    //add the size to a given info dictionary
    if (infoDictionary) {
      infoDictionary["Size"] = {width: canvas.width, height: canvas.height};
    }

    //clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!shadowColor) {
      shadowColor = "rgba( 0, 0, 0, 0.3 )";
    }

    //set the shadow on the context
    ctx.shadowColor = shadowColor;
    ctx.shadowOffsetX = shadowOffset.x;
    ctx.shadowOffsetY = shadowOffset.y;
    ctx.shadowBlur = shadowBlur;

    ctx.drawImage(imageCanvas, IMAGE_MARGIN, IMAGE_MARGIN);

    // Remove the original image
    ctx.shadowBlur = 0.0;
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(imageCanvas, IMAGE_MARGIN, IMAGE_MARGIN);

    //return data url
    return canvas.toDataURL();
  },

  getLuminosityImage: function(canvasElementsOrImageNames, color) {
    // First the image data of the combined images
    var imageCanvas = this.combinedImageCanvas(canvasElementsOrImageNames);

    //setup canvas and source image
    var canvas = document.createElement('canvas');
    canvas.width = imageCanvas.width;
    canvas.height = imageCanvas.height;
    var context = canvas.getContext('2d');
    
    context.drawImage(imageCanvas, 0.0, 0.0 , imageCanvas.width, imageCanvas.height);

    this.applyLuminocityColor(context, color, {width: canvas.width, height: canvas.height});

    return canvas.toDataURL();
  },

  /**
   *
   * @param {type} imageName
   * @param {type} color
   * @param {type} outlineSize
   * @param {type} infoDictionary
   * @returns {unresolved}
   */
  getColorOutlineImage : function(canvasElementsOrImageNames, color, outlineSize, infoDictionary) {

    var imageCanvas = this.combinedImageCanvas(canvasElementsOrImageNames);

    var canvasSize = {width: imageCanvas.width, height: imageCanvas.height};
    var imageSize = {width: imageCanvas.width, height: imageCanvas.height};
    imageSize = {
      width: imageSize.width * 2.0,
      height: imageSize.height * 2.0
    };
    canvasSize = {
      width: imageSize.width + (outlineSize * 2.0),
      height: imageSize.height + (outlineSize * 2.0)
    };

    var canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    var context = canvas.getContext('2d');

    // Set the shadow
    context.shadowColor = "rgba( 0, 0, 0, 255 )";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = outlineSize;

    context.drawImage(imageCanvas,
        outlineSize,
        outlineSize,
        imageSize.width,
        imageSize.height);

    context.shadowBlur = 0;

    context.globalCompositeOperation = "destination-out";
    context.drawImage(imageCanvas,
        outlineSize,
        outlineSize,
        imageSize.width,
        imageSize.height);

    this.applyImageOverlay(context,
        color,
        {width: canvas.width, height: canvas.height});

    var finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvasSize.width / 2.0;
    finalCanvas.height = canvasSize.height / 2.0;
    var finalContext = finalCanvas.getContext('2d');

    finalContext.drawImage(canvas, 0.0, 0.0, finalCanvas.width, finalCanvas.height);

    var dataURL = finalCanvas.toDataURL();

    if (infoDictionary) {
      infoDictionary["Size"] = {width: finalCanvas.width, height: finalCanvas.height};
    }

    //return data url
    return dataURL;
  },

  /**
   *
   * @param {type} imageName
   * @param {type} color
   * @param {type} outlineSize
   * @param {type} infoDictionary
   * @returns {unresolved}
   */
  getColorOverlayImage : function(canvasElementsOrImageNames, color) {
    var imageCanvas = this.combinedImageCanvas(canvasElementsOrImageNames);

    var canvas = document.createElement('canvas');
    canvas.width = imageCanvas.width;
    canvas.height = imageCanvas.height;
    var context = canvas.getContext('2d');

   context.drawImage(imageCanvas,
        0,
        0,
        canvas.width,
        canvas.height);

    context.globalCompositeOperation = "destination-in";

    context.drawImage(imageCanvas,
        0,
        0,
        canvas.width,
        canvas.height);

    this.applyImageOverlay(context,
        color,
        {width: canvas.width, height: canvas.height});

    return {
      width: canvas.width,
      imageData: context.getImageData(0,
        0,
        canvas.width,
        canvas.height)
    };
  },

  combinedImageCanvas: function(canvasElementsOrImageNames) {

    var canvasElements = [];
    for (var i = 0; i < canvasElementsOrImageNames.length; i ++) {
      var canvasElementOrImageName = canvasElementsOrImageNames[i];
//    canvasElementsOrImageNames.forEach(function(canvasElementOrImageName) {
      if (typeof canvasElementOrImageName === "string") {
        canvasElements.push(getImageFromCache(canvasElementOrImageName));
      }
      else {
        canvasElements.push(canvasElementOrImageName);
      }
//    });
    }

    // First get the cached textures and the size
    var cachedTextures = [];
    var largestSize = {width: 0.0, height: 0.0};
    for (var i = 0; i < canvasElements.length; i ++) {
      var canvasElement = canvasElements[i];
//    canvasElements.forEach(function(canvasElement) {
      if (canvasElement.width > largestSize.width) {
        largestSize.width = canvasElement.width;
      }
      if (canvasElement.height > largestSize.height) {
        largestSize.height = canvasElement.height;
      }
//    });
    }

    // Get the render canvas and the context
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    //setup canvas size
    canvas.width = largestSize.width;
    canvas.height = largestSize.height;

    // Draw the images
    for (var i = 0; i < canvasElements.length; i ++) {
      var canvasElement = canvasElements[i];
//    canvasElements.forEach(function(canvasElement) {
      var x = (largestSize.width - canvasElement.width) / 2.0;
      var y = (largestSize.height - canvasElement.height) / 2.0;

      //draw
      context.drawImage(canvasElement, x, y);
//    });
    }

    return canvas;
  },

  /**
   *
   * @param {type} context
   * @param {type} canvasSize
   * @param {type} color
   * @returns {undefined}
   */
  applyImageOverlay: function(context, color, canvasSize) {
    var imageData = context.getImageData(0,0, canvasSize.width, canvasSize.height);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 14) {
        data[i]     = color.r; // red
        data[i + 1] = color.g; // green
        data[i + 2] = color.b; // blue
        data[i + 3] = data[i + 3] * 50; // alpha
      }
      else {
        data[i + 3] = 0;
      }
    }
    context.putImageData(imageData, 0, 0);
  },
  
  getMargins: function(context, canvasSize) {
    var imageData = context.getImageData(0,0, canvasSize.width, canvasSize.height);
    var data = imageData.data;
    
    var left = Number.MAX_SAFE_INTEGER;
    var right = 0;

    for (var i = 0; i < data.length; i += 4) {
      var hasColor = data[i + 3] !== 0;
      if (hasColor) {
        var x = (i / 4) % canvasSize.width;
        if (x < left) {
          left = x;
        }
        if (x > right) {
          right = x;
        }
      }
    }
    
    return {left: left, right: (canvasSize.width - right) - 1};
  },
  
  applyLuminocityColor: function(context, color, canvasSize) {
    var imageData = context.getImageData(0,0, canvasSize.width, canvasSize.height);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
      var percent = (data[i] * 0.3086 + data[i + 1] * 0.6094 + data[i + 2] * 0.0820) / 255;
//      (( + data[i + 1] + data[i + 2]) / 3) / 255;
      data[i]     = percent * color.r; // red
      data[i + 1] = percent * color.g; // green
      data[i + 2] = percent * color.b; // blue
//      data[i + 3] = data[i + 3] * 50; // alpha
    }
    context.putImageData(imageData, 0, 0);
  },

  /**
   *
   * @param {type} callbackArray
   * mock: var callbackArray = {
       funcArray: [
         function() {console.log('func1');},
         function() {console.log('func2');},
         function() {console.log('func3');},
         function() {console.log('func4');}
       ],
       rgbaMapping: {
         // rgba value => index in funcArray!
         "255.0.0.255":0,
         "0.255.0.255":1,
         "0.0.255.255":2,
         "0.0.0.255":3
       }
     };
   * @param {type} imageData
   * @param {type} spriteDimensions
   * @param {type} hitPosition
   * @returns {undefined}
   */
  checkImageOverlayWithPixel: function(
    callbackArrayPos,
    callbackArrayNeg,
    imageData,
    spriteDimensions,
    hitPosition) {

    // Calculate x and y relative to top left position in sprite.
    var relativeX = Math.floor(hitPosition.x - (spriteDimensions.x - spriteDimensions.width / 2));
    var relativeY = Math.floor((spriteDimensions.y + spriteDimensions.height / 2) - hitPosition.y);

    // Calculate index in imageData array of the pixel that belongs to the hitPosition
    var imageDataArrayIndexHitPos = Math.floor(4 * ( (relativeY * spriteDimensions.width) + relativeX) );
    var i = imageDataArrayIndexHitPos; // This is done to have a descriptive variable name, and at the same time prevent code bloat.

    // Now retrieve the color of the pixel that belongs to the hitposition.
    var color = imageData[i] + '.' + imageData[i+1] + '.' + imageData[i+2] + '.' + imageData[i+3];
    var funcIndexPos = callbackArrayPos.rgbaMapping[color];
    if (funcIndexPos !== undefined) {
      callbackArrayPos.funcArray[funcIndexPos]();
    }
    // Now for each color in the 'Negative array' call its callback function!
    var mappings = Object.getOwnPropertyNames(callbackArrayNeg.rgbaMapping);
    for (var i = 0; i < mappings.length; i ++) {
      var mapping = mappings[i];
      
//    Object.getOwnPropertyNames(callbackArrayNeg.rgbaMapping).forEach(function(value) {
      if (value !== color) {
        callbackArrayNeg.funcArray[callbackArrayPos.rgbaMapping[mapping]]();
      }
//    });
    }
  }
});
GameEngine.effectHelper = new GameEngine.EffectHelper;
