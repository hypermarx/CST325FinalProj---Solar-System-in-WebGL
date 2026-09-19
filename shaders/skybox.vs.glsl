precision mediump float;

attribute vec3 aVertexPosition;
varying vec4 vPosition;

/* The technique used here is based on interpreting code in:
https://webglfundamentals.org/webgl/lessons/webgl-skybox.html
in order to implement a quad with cubemap as skybox, so you don't get the issue of parts of the skybox being
further than others */

void main() {
    vPosition = vec4(aVertexPosition, 1.0);
    gl_Position = vec4(aVertexPosition, 1.0);
}
