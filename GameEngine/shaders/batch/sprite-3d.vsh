attribute vec3 a_position;
uniform vec3 u_resolution;

attribute vec2 a_texCoord;
attribute float aAlpha;
attribute vec4 aOverlayColour;
attribute mat4 u_matrix;

varying vec2 v_texCoord;
varying float tAlpha;
varying vec4 overlayColour;

void main() {
  // Pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points
  v_texCoord = a_texCoord;
  tAlpha = aAlpha;
  overlayColour = aOverlayColour;

  // Multiply the position by the matrix.
  vec3 position = (u_matrix * vec4(a_position, 1)).xyz;
  position.z = 0.0;

  // convert the position from pixels to 0.0 to 1.0
  vec3 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec3 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec3 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace, 1);
}