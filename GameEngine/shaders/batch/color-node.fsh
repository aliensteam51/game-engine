precision mediump float;

varying vec4 color;
varying float tAlpha;

void main() {
   gl_FragColor = color;
   gl_FragColor.a *= tAlpha;
}