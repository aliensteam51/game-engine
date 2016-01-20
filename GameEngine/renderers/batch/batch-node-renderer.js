GameEngine.BatchNodeRenderer = GameEngine.Renderer.extend({
  _className: "GameEngine.BatchNodeRenderer",
  _programScripts: [["batch-node.fsh", "batch-node.vsh"], ["batch-node.fsh", "batch-node-3d.vsh"]],
  _programKeys: ["program", "program3D"],
  _doesDraw: false,
  
  setupGL: function() {
    var gl = getGL();
    var programKeys = this._programKeys;
    for (var i = 0; i < programKeys.length; i ++) {
      var programKey = programKeys[i];
//    this._programKeys.forEach(function(programKey) {
      var program = this[programKey];
      
      program.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      program.matrixLocation = gl.getAttribLocation(program, "u_matrix");
      program.positionLocation = gl.getAttribLocation(program, "a_position");
      
      if (this._doesDraw) {
        program.alphaLocation = gl.getAttribLocation(program, "aAlpha");
      
        // Set the alpha mode and enable blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
      
      gl.useProgram(program);
      
      var canvas = getCanvas();
      if (programKey === "program3D") {
        gl.uniform3f(program.resolutionLocation, canvas.width, canvas.height, canvas.width);
      }
      else {
        gl.uniform2f(program.resolutionLocation, canvas.width, canvas.height);
      }
      
      program.positionBuffer = gl.createBuffer();
      
      
      program.matrixBuffer = gl.createBuffer();
      program.alphaBuffer = gl.createBuffer();
      program.indexBuffer = gl.createBuffer();
      
//    }.bind(this));
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
      
      var shouldRender3D = false;
      // = node._shouldRender3D;
      var program = this.program;
      //shouldRender3D ? this.program3D : this.program;
      gl.useProgram(program);
      
      // MATRIX
      var matrixSize = shouldRender3D ? 16 : 9;
      
      var matrixArray = this.matrixArray;
      if (!matrixArray) {
        matrixArray = new Float32Array(nodes.length * 6 * matrixSize);
        var index = 0;
        for (var y = 0; y < nodes.length; y ++) {
          var node = nodes[y];
//        nodes.forEach(function(node) {
          var matrix = node._matrix;
          for (var i = 0; i < 4; i ++) {
            for (var x = 0; x < matrix.length; x ++) {
              matrixArray[index] = matrix[x];
              index ++;
            }
          }
//        });
        }
        this.matrixArray = matrixArray;
      }
      else {
        var index = 0;
        for (var y = 0; y < nodes.length; y ++) {
          var node = nodes[y];
//        nodes.forEach(function(node) {
          var matrix = node._matrix;
          for (var i = 0; i < 4; i ++) {
            for (var x = 0; x < matrix.length; x ++) {
              matrixArray[index] = matrix[x];
              index ++;
            }
          }
//        });
        }
      }
      
//      console.log("matrixArray", matrixArray);
      
      var byteSize = matrixArray.BYTES_PER_ELEMENT;
      
      var matrixLocation = program.matrixLocation;
      gl.bindBuffer(gl.ARRAY_BUFFER, program.matrixBuffer);
      
      var matrixCreated = this._matrixCreated;
      if (!matrixCreated) {
        this._matrixCreated = true;
        gl.bufferData(gl.ARRAY_BUFFER, matrixArray, gl.DYNAMIC_DRAW);
      }
      else {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixArray);
      }
      
      var size = shouldRender3D ? 4 : 3;
      gl.enableVertexAttribArray(matrixLocation);
      gl.vertexAttribPointer(matrixLocation, shouldRender3D ? 4 : 3, gl.FLOAT, false, matrixSize * byteSize, 0);
      
      gl.enableVertexAttribArray(matrixLocation + 1);
      gl.vertexAttribPointer(matrixLocation + 1, shouldRender3D ? 4 : 3, gl.FLOAT, false, matrixSize * byteSize, size * byteSize);
      
      gl.enableVertexAttribArray(matrixLocation + 2);
      gl.vertexAttribPointer(matrixLocation + 2, shouldRender3D ? 4 : 3, gl.FLOAT, false, matrixSize * byteSize, (size * byteSize) * 2);

//      gl.enableVertexAttribArray(matrixLocation + 3);
//      gl.vertexAttribPointer(matrixLocation + 3, shouldRender3D ? 4 : 3, gl.FLOAT, false, matrixSize * size * byteSize, matrixSize * 4 * byteSize);
      
      // ALPHA
      var alphaArray = this.alphaArray;
      if (!alphaArray) {
        alphaArray = new Float32Array(nodes.length * 6);
        var index = 0;
        for (var y = 0; y < nodes.length; y ++) {
          var node = nodes[y];
//        nodes.forEach(function(node) {
          var alpha = node._alpha;
          for (var i = 0; i < 6; i ++) {
            alphaArray[index] = alpha;
            index ++;
          }
//        });
        }
        this.alphaArray = alphaArray;
//      }
      
      var alphaLocation = program.alphaLocation;
//      console.log("program", program);
      gl.bindBuffer(gl.ARRAY_BUFFER, program.alphaBuffer);
      
      var alphaCreated = this._alphaCreated;
      if (!alphaCreated) {
        this._alphaCreated = true;
        gl.bufferData(gl.ARRAY_BUFFER, alphaArray, gl.DYNAMIC_DRAW);
      }
      else {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, alphaArray);
      }
      
      gl.enableVertexAttribArray(alphaLocation);
      gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 0, 0);
      }
      
      // POSITION
      rectangleSize = shouldRender3D ? 3 : 2;
      var rectangleArray = this.rectangleArray;
      if (!rectangleArray) {
        //shouldRender3D ? 18 : 12;
        var rectangleArray = new Float32Array(nodes.length * 12);
        var index = 0;
        for (var y = 0; y < nodes.length; y ++) {
          var node = nodes[y];
//        nodes.forEach(function(node) {
          
          var contentSize = node._contentSize;
          
          rectangleArray[index + 0] = 0.0;
          rectangleArray[index + 1] = contentSize.height;
          rectangleArray[index + 2] = 0.0;
          
          rectangleArray[index + 3] = 0.0;
          rectangleArray[index + 4] = 0.0;
          rectangleArray[index + 5] = 0.0
          
          rectangleArray[index + 6] = contentSize.width;
          rectangleArray[index + 7] = 0.0;
          rectangleArray[index + 8] = 0.0
          
          rectangleArray[index + 9] = contentSize.width;
          rectangleArray[index + 10] = contentSize.height;
          rectangleArray[index + 11] = 0.0
          
          index += 12;
//        });
        }
        this.rectangleArray = rectangleArray;
      
//      console.log("rectangleArray", rectangleArray);
//      console.log("POSITION LENGTH = " + rectangleArray.length);
      
      var positionLocation = program.positionLocation;
      
      gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
      
      var bufferCreated = this._bufferCreated;
      if (!bufferCreated) {
        this._bufferCreated = true;
        gl.bufferData(gl.ARRAY_BUFFER, rectangleArray, gl.DYNAMIC_DRAW);
      }
      else {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, rectangleArray);
      }
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
      }
      
      // INDICES
      var indices = this.indices;
      if (!indices) {
        indices = new Uint16Array(nodes.length * 6);
        for (var i = 0, j = 0; i < nodes.length * 4; i += 6, j += 4)
        {
            indices[i + 0] = j + 0;
            indices[i + 1] = j + 1;
            indices[i + 2] = j + 2;
            indices[i + 3] = j + 0;
            indices[i + 4] = j + 2;
            indices[i + 5] = j + 3;
        }
        this.indices = indices;
      
      
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, program.indexBuffer);
      
      var indexCreated = this._indexCreated;
      if (!indexCreated) {
        this._indexCreated = true;
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.DYNAMIC_DRAW);
      }
      else {
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, indices);
      }
      
      }
    
      gl.drawElements(gl.TRIANGLES, nodes.length * 6, gl.UNSIGNED_SHORT, 0);
      
//      if (parent && parent._clipsToBounds) {
//        gl.disable( gl.DEPTH_TEST );
//        gl.disable(gl.STENCIL_TEST);
//      }
    }
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
GameEngine.batchNodeRenderer = new GameEngine.BatchNodeRenderer();