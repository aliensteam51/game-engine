function loadFile(url, completion) {
  var client = new XMLHttpRequest();
  client.open('GET', url);
  client.onreadystatechange = function() {
    if (client.readyState === 4) { // TODO - error checking
      if (completion) {
        completion(client.responseText);
      }
      else {
        console.warn("WARNING: loaded file without completion is pretty useless, stop doing that!!!");
      }
    }
  }
  client.send();
}

function loadScripts(scripts, completion) {
  var scriptsCount = scripts.length;
  if (scriptsCount === 0) {
    if (completion) {
      completion();
    }
    return;
  }
  
  var completionFunction = function() {
    scriptsCount --;
    if (scriptsCount === 0) {
      if (completion) {
        completion();
      }
    }
  };
  
  for (var i = 0; i < scriptsCount; i ++) {
    var script = scripts[i];
//  scripts.forEach(function(script) {
    loadFile(script.src, function(text) {
      this.text = text;
      completionFunction();
    }.bind(script));
//  });
  }
}

var images = {};
var preloadedJSONFiles = {};

function addImagesToCache(imageURLs, completion) {
  var completionCount = imageURLs.length;
  for (var i = 0; i < imageURLs.length; i ++) {
    var imageURL = imageURLs[i];
//  imageURLs.forEach(function(imageURL) {
    var image = new Image();
    image.src = imageURL;
    image.onload = function() {
      images[imageURL] = image;
      completionCount--;
      if (completionCount === 0) {
        if (completion) {
          completion();
        }
      }
    }
//  });
  }
}

function preloadFiles(urls, completion) {
  var preloadCount = urls.length;
  if (preloadCount === 0) {
    if (completion) {
      completion();
    }
  }
  
  var completionFunction = function() {
    preloadCount--;
    if (preloadCount === 0) {
      if (completion) {
        completion();
      }
    }
  };
  
  for (var i = 0; i < urls.length; i ++) {
    var url = urls[i];
    var extension = getFileExtension(url);
    if (isImageExtension(extension)) {
      loadImage(url, completionFunction);
    }
    else if (extension === "json") {
      loadJSON(url, completionFunction);
    }
    else {
      console.warn("GameEngine - utils.js (preloadFiles): Tried to preload unkown file type", url);
    }
  }
}

function loadJSON(url, completion) {
  loadFile(url, function(data) {
    var JSONObject = JSON.parse(data);
    if (JSONObject) {
      preloadedJSONFiles[url] = JSONObject;
      if (completion) {
        completion();
      }
    }
    else {
      console.warn("GameEngine - utils.js (loadJSON): Could not load JSON file", url);
      
      if (completion) {
        completion();
      }
    }
  });
}

function getJSONFromCache(url) {
  return preloadedJSONFiles[url];
}

// source: http://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
function getFileExtension(url) {
  return url.slice((url.lastIndexOf(".") - 1 >>> 0) + 2);
}

function isImageExtension(extension) {
  var supportedImageExtensions = ["jpg", "jpeg", "png"];
  return supportedImageExtensions.indexOf(extension) !== -1;
}

function getImageFromCache(url) {
  return images[url];
}

function loadImage(url, completion) {
  var cachedImage = images[url];
  if (cachedImage) {
    completion(cachedImage);
    return;
  }
  var image = new Image();
  image.src = url;
  image.onload = function() {
    images[url] = image;
    if (completion) {
      completion(image);
    }
  }
}

var gl;
function getGL() {
  if (!gl) {
    gl = getCanvas().getContext('webgl', {premultipliedAlpha: false, antialias : true, alpha: false, stencil: true});
  }
  return gl;
}

var canvas;
function getCanvas() {
  if (!canvas) {
    canvas = document.getElementById("glCanvas");
  }
  return canvas;
}

function rectContainsPoint(rect, point) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function rectInsideRect(rect1, rect2) {
  return  (rect1.x >= rect2.x && rect1.x <= rect2.x + rect2.width ||
          rect1.x + rect1.width >= rect2.x && rect1.x + rect1.width <= rect2.x + rect2.width) &&
          (rect1.y >= rect2.y && rect2.y <= rect2.y + rect2.height ||
          rect1.y + rect1.height >= rect2.y && rect1.y + rect1.height <= rect2.y + rect2.height);
}

// Based on: http://www.kirupa.com/html5/getting_mouse_click_position.htm
function getEventPosition(event) {
  var targetElement = event.currentTarget;
    if (targetElement) {
    var element = targetElement;
    
    var xPosition = 0;
    var yPosition = 0;
    
    while (element) {
      xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
      yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
      element = element.offsetParent;
    }
    
    return {x: event.clientX - xPosition, y: targetElement.height - (event.clientY - yPosition)};
  }
  else {
    return {x: -10000, y: -10000};
  }
}

// Source: https://remysharp.com/2010/07/21/throttling-function-calls
function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}