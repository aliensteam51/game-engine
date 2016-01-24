GameEngine.GLBatchNodeRenderer = GameEngine.GLRenderer.extend({
  _className: "GameEngine.GLBatchNodeRenderer",
  _programScripts: [["batch-node.fsh", "simple-batch-node.vsh"], ["batch-node.fsh", "batch-node.vsh"], ["batch-node.fsh", "batch-node-3d.vsh"]],
  _programKeys: ["simpleProgram", "program", "program3D"],
  _doesDraw: false,
  
  setupGL: function() {
    var gl = getGL();
    var programKeys = this._programKeys;
    for (var i = 0; i < programKeys.length; i ++) {
      var programKey = programKeys[i];
      var program = this[programKey];
      
      // Get the resolution and position location
      program.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      program.positionLocation = gl.getAttribLocation(program, "a_position");
      
      if (programKey === "simpleProgram") {
        // Get the transformation locations
        program.translationLocation = gl.getAttribLocation(program, "u_translation");
        program.rotationLocation = gl.getAttribLocation(program, "u_rotation");
        program.scaleLocation = gl.getAttribLocation(program, "u_scale");
        program.anchorpointLocation = gl.getAttribLocation(program, "u_anchorpoint");
        program.sizeLocation = gl.getAttribLocation(program, "u_size");
      }
      else {
        // Get the matrix location
        program.matrixLocation = gl.getAttribLocation(program, "u_matrix");
      }
      
      // Set the program as current program
      gl.useProgram(program);
      
      // Set the max number of items to render in the buffer
      var bufferItemLength = 1000;
      
      if (this._doesDraw) {
        // Set the alpha mode and enable blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        // Get the alpha location
        program.alphaLocation = gl.getAttribLocation(program, "aAlpha");
        
        // Create alpha buffer
        program.alphaBuffer = createBuffer(4, 1, bufferItemLength, gl);
      }
      
      // Set the resolution
      var canvas = getCanvas();
      if (programKey === "program3D") {
        gl.uniform3f(program.resolutionLocation, canvas.width, canvas.height, canvas.width);
      }
      else {
        gl.uniform2f(program.resolutionLocation, canvas.width, canvas.height);
      }
      
      // Create a position buffer
      program.positionBuffer = createBuffer(12, 3, bufferItemLength, gl);
      
      if (programKey === "simpleProgram") {
        // Create transofrm buffers
        program.translationBuffer = createBuffer(4, 2, bufferItemLength, gl);
        program.rotationBuffer = createBuffer(4, 2, bufferItemLength, gl);
        program.scaleBuffer = createBuffer(4, 2, bufferItemLength, gl);
        program.anchorpointBuffer = createBuffer(4, 2, bufferItemLength, gl);
        program.sizeBuffer = createBuffer(4, 2, bufferItemLength, gl);
      }
      else {
        // Create a matrix buffer
        program.matrixBuffer = createBuffer(4, 9, bufferItemLength, gl);
      }
      
      // Create a index Buffer
      var indexBuffer = gl.createBuffer();
      var bufferSize = bufferItemLength * 6;
      
      var indexArray = new Uint16Array(bufferItemLength * 6);
      for (var x = 0, j = 0; x < bufferItemLength * 6; x += 6, j += 4)
      {
          indexArray[x + 0] = j + 0;
          indexArray[x + 1] = j + 1;
          indexArray[x + 2] = j + 2;
          indexArray[x + 3] = j + 0;
          indexArray[x + 4] = j + 2;
          indexArray[x + 5] = j + 3;
      }
      
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.DYNAMIC_DRAW);
      program.indexBuffer = indexBuffer;
      program.indexArray = indexArray;
    }
  },
  
  
  
  matrixArray: null,
  alphaArray: null,
  rectangleArray: null,
  indices: null,
  
   render: function(nodes) {
    if (this._doesDraw) {
      var gl = getGL();
      
//      var parent = node._parent;
//      if (parent && parent._clipsToBounds) {
//        gl.enable( gl.DEPTH_TEST );
//        gl.enable(gl.STENCIL_TEST);
//        
//        parent._renderer.stencil();
//      }
      var nodeLength = this.nodeLength;
      var shouldRender3D = false;
      
      var renderMode = nodes[0]._renderMode;
      
      // = node._shouldRender3D;
      var program = this[this._programKeys[renderMode]];
      //shouldRender3D ? this.program3D : this.program;
      gl.useProgram(program);
      
      // MATRIX
      if (renderMode === GameEngine.RenderMode.Normal) {
        var matrixSize = shouldRender3D ? 16 : 9;
        
        var matrixArray = this.matrixArray;
        matrixArray = new Float32Array(nodes.length * 6 * matrixSize);
        var index = 0;
        for (var y = 0; y < nodes.length; y ++) {
          var node = nodes[y];
          var matrix = node._matrix;
          for (var i = 0; i < 4; i ++) {
            for (var x = 0; x < matrix.length; x ++) {
              matrixArray[index] = matrix[x];
              index ++;
            }
          }
        }
        
//      else {
//        var index = 0;
//        for (var y = 0; y < nodes.length; y ++) {
//          var node = nodes[y];
//          var matrix = node._matrix;
//          for (var i = 0; i < 4; i ++) {
//            for (var x = 0; x < matrix.length; x ++) {
//              matrixArray[index] = matrix[x];
//              index ++;
//            }
//          }
//        }
//      }
        
      var byteSize = matrixArray.BYTES_PER_ELEMENT;
      
      var matrixLocation = program.matrixLocation;
      gl.bindBuffer(gl.ARRAY_BUFFER, program.matrixBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixArray);
      
      var size = shouldRender3D ? 4 : 3;
      gl.enableVertexAttribArray(matrixLocation);
      gl.vertexAttribPointer(matrixLocation, shouldRender3D ? 4 : 3, gl.FLOAT, false, matrixSize * byteSize, 0);
      
      gl.enableVertexAttribArray(matrixLocation + 1);
      gl.vertexAttribPointer(matrixLocation + 1, shouldRender3D ? 4 : 3, gl.FLOAT, false, matrixSize * byteSize, size * byteSize);
      
      gl.enableVertexAttribArray(matrixLocation + 2);
      gl.vertexAttribPointer(matrixLocation + 2, shouldRender3D ? 4 : 3, gl.FLOAT, false, matrixSize * byteSize, (size * byteSize) * 2);
      }
      
      // ALPHA
      this.uploadProperty(null, "_alpha", nodes, program.alphaLocation, program.alphaBuffer, false, 1);
      
      if (renderMode === GameEngine.RenderMode.Simple) {
        this.uploadProperty(null, "_translation_t", nodes, program.translationLocation, program.translationBuffer, false, 2);
        this.uploadProperty(null, "_rotation_t", nodes, program.rotationLocation, program.rotationBuffer, false, 2);
        this.uploadProperty(null, "_scale_t", nodes, program.scaleLocation, program.scaleBuffer, false, 2);
        this.uploadProperty(null, "_contentSize_t", nodes, program.sizeLocation, program.sizeBuffer, false, 2);
        this.uploadProperty(null, "_anchorPoint_t", nodes, program.anchorpointLocation, program.anchorpointBuffer, false, 2);
      }
      
      // POSITION
      rectangleSize = shouldRender3D ? 3 : 2;
      var rectangleArray = this.rectangleArray;
      var rectangleArray = new Float32Array(nodes.length * 12);
      var index = 0;
      for (var y = 0; y < nodes.length; y ++) {
        var node = nodes[y];
        
        var contentSize = node._contentSize;
        var texturePadding = node._texturePadding;
        var left = texturePadding.left;
        var bottom = texturePadding.bottom;
        var right = texturePadding.right;
        var top = texturePadding.top;
        
        rectangleArray[index + 0] = left;
        rectangleArray[index + 1] = contentSize.height - top;
        rectangleArray[index + 2] = 0.0;
        
        rectangleArray[index + 3] = left;
        rectangleArray[index + 4] = bottom;
        rectangleArray[index + 5] = 0.0
        
        rectangleArray[index + 6] = contentSize.width - right;
        rectangleArray[index + 7] = bottom;
        rectangleArray[index + 8] = 0.0
        
        rectangleArray[index + 9] = contentSize.width - right;
        rectangleArray[index + 10] = contentSize.height - top;
        rectangleArray[index + 11] = 0.0
        
        index += 12;
      }
      this.rectangleArray = rectangleArray;
      
      var positionLocation = program.positionLocation;
      
      gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, rectangleArray);
      
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    
      gl.drawElements(gl.TRIANGLES, nodes.length * 6, gl.UNSIGNED_SHORT, 0);
      
//      if (parent && parent._clipsToBounds) {
//        gl.disable( gl.DEPTH_TEST );
//        gl.disable(gl.STENCIL_TEST);
//      }
    }
  },
  
  arrays: null,
  uploadProperty: function(property, propertyKey, nodes, location, buffer, recreate, propertyLength) {
    var nodeLength = this.nodeLength;
  
    var arrays = this.arrays;
    if (!arrays) {
      arrays = {};
      this.arrays = arrays;
    }
  
    var array = arrays[propertyKey];
    if (!array || propertyKey === "_translation_t" || nodes.length !== nodeLength) {
      array = new Float32Array(nodes.length * 4 * propertyLength);
      var index = 0;
      for (var y = 0; y < nodes.length; y ++) {
        var node = nodes[y];
        var nodeProperty = property !== null ? property : node[propertyKey];
        for (var i = 0; i < 4; i ++) {
          if (nodeProperty instanceof Array) {
            for (var x = 0; x < nodeProperty.length; x ++) {
              array[index] = nodeProperty[x];
              index ++;
            }
          }
          else {
            array[index] = nodeProperty;
            index ++;
          }
        }
      }
      arrays[propertyKey] = array;
    }
    else if (!recreate) {
      return;
    }
      
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, array);
    
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, propertyLength, gl.FLOAT, false, 0, 0);
  },
  
  stencil: function(node) {
    var gl = getGL();
    var shouldRender3D = node._shouldRender3D;
    var program = shouldRender3D ? this.program3D : this.program;
    gl.useProgram(program);
    
    gl.clearStencil(0);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.colorMask(false, false, false, false);
    gl.stencilFunc(gl.ALWAYS, 1, ~0);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
    
    // look up where the vertex data needs to go.
    var positionLocation = program.positionLocation;
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, node.rectangleArray, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, shouldRender3D ? 3 : 2, gl.FLOAT, false, 0, 0);
    
    gl.uniform1f(program.alphaLocation, node._alpha);
    
    if (this._shouldRender3D) {
      gl.uniformMatrix4fv(program.matrixLocation, false, node._matrix);
    }
    else {
      gl.uniformMatrix3fv(program.matrixLocation, false, node._matrix);
    }
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.colorMask(true, true, true, true);
    gl.depthMask(gl.TRUE);
    gl.stencilFunc(gl.EQUAL, 1, ~0);
    gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
  },
});