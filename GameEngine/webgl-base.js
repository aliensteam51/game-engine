/**
* Creates and compiles a shader.
*
* @param {!WebGLRenderingContext} gl The WebGL Context.
* @param {string} shaderSource The GLSL source code for the shader.
* @param {number} shaderType The type of shader, VERTEX_SHADER or FRAGMENT_SHADER. 
* @return {!WebGLShader} The shader.
*/
function compileShader(gl, shaderSource, shaderType) {
  // Create the shader object
  var shader = gl.createShader(shaderType);

  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check if it compiled
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    // Something went wrong during compilation; get the error
    throw "could not compile shader:" + gl.getShaderInfoLog(shader) + " shaderSource" + shaderSource;
  }

  return shader;
}

/**
* Creates a program from 2 shaders.
*
* @param {!WebGLRenderingContext} gl The WebGL context.
* @param {!WebGLShader} vertexShader A vertex shader.
* @param {!WebGLShader} fragmentShader A fragment shader.
* @return {!WebGLProgram} A program.
*/
function createProgram(gl, vertexShader, fragmentShader) {
  // create a program.
  var program = gl.createProgram();

  // attach the shaders.
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // link the program.
  gl.linkProgram(program);

  // Check if it linked.
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    // something went wrong with the link
    throw ("program filed to link:" + gl.getProgramInfoLog (program));
  }

  return program;
}

/**
* Creates a shader from the content of a script tag.
*
* @param {!WebGLRenderingContext} gl The WebGL Context.
* @param {string} scriptId The id of the script tag.
* @param {string} opt_shaderType. The type of shader to create.
*     If not passed in will use the type attribute from the
*     script tag.
* @return {!WebGLShader} A shader.
*/
function createShaderFromScript(gl, scriptId, opt_shaderType) {
  // look up the script tag by id.
  var shaderScript = document.getElementById(scriptId);
  if (!shaderScript) {
    throw("*** Error: unknown script element", scriptId);
  }

  // extract the contents of the script tag.
  var shaderSource = shaderScript.text;
  // If we didn't pass in a type, use the 'type' from
  // the script tag.
  if (!opt_shaderType) {
    if (shaderScript.type == "x-shader/x-vertex") {
      opt_shaderType = gl.VERTEX_SHADER;
    } else if (shaderScript.type == "x-shader/x-fragment") {
      opt_shaderType = gl.FRAGMENT_SHADER;
    } else if (!opt_shaderType) {
      throw("*** Error: shader type not set");
    }
  }

  return compileShader(gl, shaderSource, opt_shaderType);
}

/**
* Creates a program from 2 script tags.
*
* @param {!WebGLRenderingContext} gl The WebGL Context.
* @param {string} vertexShaderId The id of the vertex shader script tag.
* @param {string} fragmentShaderId The id of the fragment shader script tag.
* @return {!WebGLProgram} A program
*/
function createProgramFromScripts(gl, vertexShaderId, fragmentShaderId) {
  var vertexShader = createShaderFromScript(gl, vertexShaderId);
  var fragmentShader = createShaderFromScript(gl, fragmentShaderId);
  return createProgram(gl, vertexShader, fragmentShader);
}

function makeTranslation(tx, ty) {
  return [
    1, 0, 0,
    0, 1, 0,
    tx, ty, 1
  ];
}

function make3DTranslation(tx, ty, tz) {
  return [
    1,  0,  0,  0,
    0,  1,  0,  0,
    0,  0,  1,  0,
    tx, ty, tz, 1
  ];
}

function makeRotation(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
  return [
    c,-s, 0,
    s, c, 0,
    0, 0, 1
  ];
}

function make3DRotationX(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
  return [
    1, 0, 0, 0,
    0, c, -s, 0,
    0, s, c, 0,
    0, 0, 0, 1
  ];
}

function make3DRotationY(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
  
  return [
    c, 0, s, 0,
    0, 1, 0, 0,
    -s, 0, c, 0,
    0, 0, 0, 1
  ];
}

function make3DRotationZ(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
  return [
    c, -s,  0,  0,
    s,  c,  0,  0,
    0,  0,  1,  0,
    0,  0,  0,  1
  ];
}

function makeScale(sx, sy) {
  return [
    sx, 0, 0,
    0, sy, 0,
    0, 0, 1
  ];
}

function make3DScale(sx, sy, sz) {
  return [
    sx, 0,  0,  0,
    0,  sy, 0,  0,
    0,  0,  sz, 0,
    0,  0,  0,  1
  ];
}

function matrixMultiply(a, b) {
  var a00 = a[0*3+0];
  var a01 = a[0*3+1];
  var a02 = a[0*3+2];
  var a10 = a[1*3+0];
  var a11 = a[1*3+1];
  var a12 = a[1*3+2];
  var a20 = a[2*3+0];
  var a21 = a[2*3+1];
  var a22 = a[2*3+2];
  var b00 = b[0*3+0];
  var b01 = b[0*3+1];
  var b02 = b[0*3+2];
  var b10 = b[1*3+0];
  var b11 = b[1*3+1];
  var b12 = b[1*3+2];
  var b20 = b[2*3+0];
  var b21 = b[2*3+1];
  var b22 = b[2*3+2];
  return [a00 * b00 + a01 * b10 + a02 * b20,
          a00 * b01 + a01 * b11 + a02 * b21,
          a00 * b02 + a01 * b12 + a02 * b22,
          a10 * b00 + a11 * b10 + a12 * b20,
          a10 * b01 + a11 * b11 + a12 * b21,
          a10 * b02 + a11 * b12 + a12 * b22,
          a20 * b00 + a21 * b10 + a22 * b20,
          a20 * b01 + a21 * b11 + a22 * b21,
          a20 * b02 + a21 * b12 + a22 * b22];
}

function convert2DMatrix(matrix) {
  var newMatrix = [];
  
  newMatrix[0] = matrix[0];
  newMatrix[1] = matrix[1];
  newMatrix[2] = matrix[2];
  newMatrix[3] = 0.0;
  
  newMatrix[4] = matrix[3];
  newMatrix[5] = matrix[4];
  newMatrix[6] = matrix[5];
  newMatrix[7] = 0.0;
  
  newMatrix[8] = 0.0;
  newMatrix[9] = 0.0;
  newMatrix[10] = matrix[8];
  newMatrix[11] = 0.0;
  
  newMatrix[12] = matrix[6];
  newMatrix[13] = matrix[7];
  newMatrix[14] = 0.0;
  newMatrix[15] = 1.0;
  
  return newMatrix;
}

function matrix3DMultiply(matrix1, matrix2) {
  var a, b;

  if (matrix1.length === 16) {
    a = matrix1;
  }
  else if (matrix1.length === 9) {
    a = convert2DMatrix(matrix1);
  }
  
  if (matrix2.length === 16) {
    b = matrix2;
  }
  else if (matrix2.length === 9) {
    b = convert2DMatrix(matrix2);
  }

  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  
  var a30 = a[12];
  var a31 = a[13];
  var a32 = a[14];
  var a33 = a[15];

  var b00 = b[0];
  var b01 = b[1];
  var b02 = b[2];
  var b03 = b[3];
  
  var b10 = b[4];
  var b11 = b[5];
  var b12 = b[6];
  var b13 = b[7];
  
  var b20 = b[8];
  var b21 = b[9];
  var b22 = b[10];
  var b23 = b[11];
  
  var b30 = b[12];
  var b31 = b[13];
  var b32 = b[14];
  var b33 = b[15];
  
  return [
  b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
  b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
  b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
  b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
  b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
  b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
  b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
  b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
  b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
  b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
  b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
  b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
  b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
  b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
  b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
  b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
  ];
}

// Source http://jsperf.com/inverse-matrix-4x4/6

function osgjsInverse(matrix, resultArg) {
  var a = matrix;
  var out = [];
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
      a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
      a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
      a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,

      // Calculate the determinant
      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) { 
      return null; 
  }
  det = 1.0 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

  return out;
}

function transpose(a) {  
  // Calculate the width and height of the Array
  var w = a.length ? a.length : 0,
    h = a[0] instanceof Array ? a[0].length : 0;

  // In case it is a zero matrix, no transpose routine needed.
  if(h === 0 || w === 0) { return a; }

  /**
   * @var {Number} i Counter
   * @var {Number} j Counter
   * @var {Array} t Transposed data is stored in this array.
   */
  var i, j, t = [];

  // Loop through every item in the outer array (height)
  for(i=0; i<h; i++) {

    // Insert a new row (array)
    t[i] = [];

    // Loop through every item per item in outer array (width)
    for(j=0; j<w; j++) {

      // Save transposed data.
      t[i][j] = a[j][i];
    }
  }

  return t;
}