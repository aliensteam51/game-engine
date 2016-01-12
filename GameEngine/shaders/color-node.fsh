precision mediump float;

uniform vec4 color;
uniform float tAlpha;

void main() {
   gl_FragColor = color;
   gl_FragColor.a *= tAlpha;
}