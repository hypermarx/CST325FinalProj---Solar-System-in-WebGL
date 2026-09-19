precision mediump float;

uniform samplerCube uTexture;
uniform mat4 uViewDirectionProjectionInv;
varying vec4 vPosition;

void main() {
    vec4 t = uViewDirectionProjectionInv * vPosition;
    gl_FragColor = textureCube(uTexture, normalize(t.xyz / t.w));
}
