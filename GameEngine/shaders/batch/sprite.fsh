precision mediump float;
 
// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;
varying float tAlpha;
varying vec4 overlayColour;

void main() {
//  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
//  return;

   // Look up a color from the texture.
   vec4 color = texture2D(u_image, v_texCoord);
//   color.r = overlayColour.a * overlayColour.r + (1.0 - overlayColour.a) * color.r;
//   color.g = overlayColour.a * overlayColour.g + (1.0 - overlayColour.a) * color.g;
//   color.b = overlayColour.a * overlayColour.b + (1.0 - overlayColour.a) * color.b;
   
   gl_FragColor = color;
   gl_FragColor.a *= tAlpha;
}