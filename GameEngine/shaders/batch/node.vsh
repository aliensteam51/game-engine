uniform vec2 u_resolution;
attribute mat3 u_matrix;
attribute vec2 a_position;

attribute float aAlpha;
attribute vec4 aColour;

varying float tAlpha;
varying vec4 color;

void main() {
  // Pass stuff
  tAlpha = aAlpha;
  color = aColour;

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