function loadFile(url, completion) {
  var client = new XMLHttpRequest();
  client.open('GET', url);
  client.onreadystatechange = function() {
    if (client.readyState === 4) { // TODO - error checking
      if (completion) {
        completion(client.responseText);
      }
      else {
        console.log("WARNING: loaded file without completion is pretty useless, stop doing that!!!");
      }
    }
  }
  client.send();
}

function loadScripts(scripts, index, completion) {
  if (index === scripts.length || scripts.length === 0) {
    if (completion) {
      completion();
    }
    return;
  }
  var script = scripts[index];
  loadFile(script.src, function(text) {
    script.text = text;
    loadScripts(scripts, index + 1, completion);
  });
}

var images = {};

function addImagesToCache(imageURLs, completion) {
  var completionCount = imageURLs.length;
  imageURLs.forEach(function(imageURL) {
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
  });
}

function preloadFiles(urls, completion) {
  var preloadCount = urls.length;
  if (preloadCount === 0) {
    if (completion) {
      completion();
    }
  }
  
  urls.forEach(function(url) {
    loadImage(url, function(image) {
      preloadCount--;
      if (preloadCount === 0) {
        if (completion) {
          completion();
        }
      }
    });
  });
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