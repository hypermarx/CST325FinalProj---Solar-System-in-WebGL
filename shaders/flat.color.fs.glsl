precision mediump float;

uniform sampler2D uTexture;

varying vec2 vTexCoords;

void main() {
    vec4 color = texture2D(uTexture, vTexCoords);
    gl_FragColor = color;
}

