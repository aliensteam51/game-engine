precision mediump float;
 
// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;
uniform float tAlpha;
uniform vec4 overlayColour;
varying float rotationDarknes;

void main() {
   // Look up a color from the texture.
   vec4 color = texture2D(u_image, v_texCoord);
   color.r = overlayColour.a * overlayColour.r + (1.0 - overlayColour.a) * color.r;
   color.g = overlayColour.a * overlayColour.g + (1.0 - overlayColour.a) * color.g;
   color.b = overlayColour.a * overlayColour.b + (1.0 - overlayColour.a) * color.b;
   
   gl_FragColor = color;
   gl_FragColor.a *= tAlpha;
   
//   float darknes = 1.0 - rotationDarknes;
   gl_FragColor.r -= rotationDarknes;
   gl_FragColor.g -= rotationDarknes;
   gl_FragColor.b -= rotationDarknes;
//   gl_FragColor.a -= rotationDarknes;
   
//   gl_FragColor = vec4(gl_FragColor.rgb, );
   //gl_FragColor.a);
   
//   gl_FragColor *= overlayColor;
//   gl_FragColor.r *= overlayColor.r;
   
//  gl_FragColor.r *= 255.0;
//  gl_FragColor.r *= 255.0;
//  gl_FragColor.r *= 255.0;
   
//  gl_FragColor.r = (gl_FragColor.r * .393) + (gl_FragColor.g *.769) + (gl_FragColor.b * .189);
//  gl_FragColor.g = (gl_FragColor.r * .349) + (gl_FragColor.g *.686) + (gl_FragColor.b * .168);
//  gl_FragColor.b = (gl_FragColor.r * .272) + (gl_FragColor.g *.534) + (gl_FragColor.b * .131);
}