precision mediump float;

attribute vec2 a_position;
uniform vec2 u_resolution;

attribute vec2 a_texCoord;
attribute float aAlpha;
attribute vec4 aOverlayColour;
attribute mat3 u_matrix;

varying vec2 v_texCoord;
varying float tAlpha;
varying vec4 overlayColour;

void main() {
//  mat3 otherMatrix = u_matrix;
//  otherMatrix[2] = vec3(136.96015348609058, 308.0166677448691, 1);

  // Pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points
  v_texCoord = a_texCoord;
  tAlpha = aAlpha;
  overlayColour = aOverlayColour;
  
  // Multiply the position by the matrix.
  vec2 position = (u_matrix * vec3(a_position, 1)).xy;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}