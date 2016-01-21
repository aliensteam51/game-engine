precision mediump float;

attribute vec2 a_position;
uniform vec2 u_resolution;

attribute vec2 a_texCoord;
varying vec2 v_texCoord;

attribute vec2 u_translation;
attribute vec2 u_rotation;
attribute vec2 u_scale;
attribute vec2 u_anchorpoint;
attribute vec2 u_size;

attribute float aAlpha;
attribute vec4 aColour;

varying float tAlpha;
varying vec4 overlayColour;
attribute vec4 aOverlayColour;

void main() {
  // Pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points
  v_texCoord = a_texCoord;
  tAlpha = aAlpha;
  overlayColour = aOverlayColour;
  
  // Scale the positon
  vec2 scaledPosition = a_position * u_scale;
  
  vec2 scaledSize = u_size * u_scale;
  
  scaledPosition.x -= u_anchorpoint.x * scaledSize[0];
  scaledPosition.y -= u_anchorpoint.y * scaledSize[1];
  
  // Rotate the position
  vec2 rotatedPosition = vec2(
     scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
     scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x);
     
  scaledPosition.x += u_anchorpoint.x * u_size[0];
  scaledPosition.y += u_anchorpoint.y * u_size[1];
 
  // Add in the translation.
  vec2 position = rotatedPosition + u_translation;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}