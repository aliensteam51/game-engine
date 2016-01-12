attribute vec2 a_position;
uniform vec2 u_resolution;

attribute vec2 a_texCoord;
varying vec2 v_texCoord;

attribute vec2 u_translation;
//uniform vec2 u_rotation;
//uniform vec2 u_scale;

void main() {
  // Pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points
  v_texCoord = a_texCoord;

  // Scale the positon
//  vec2 scaledPosition = a_position * u_scale;

  // Rotate the position
//  vec2 rotatedPosition = vec2(a_position.x * u_rotation.y + a_position.y * u_rotation.x, a_position.y * u_rotation.y - a_position.x * u_rotation.x);

  // Add in the translation.
  vec2 position = a_position + u_translation;

  // Multiply the position by the matrix.
//  vec2 position = (u_matrix * vec3(a_position, 1)).xy;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}