precision mediump float;

uniform vec3 uLightPosition;
uniform sampler2D uTexture;

varying vec2 vTexCoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
    vec3 normalDirection = normalize(uLightPosition - vWorldPosition);
    vec3 worldNormal = normalize(vWorldNormal);

    float lambert = max(0.0, dot(worldNormal, normalDirection));

    vec3 albedo = texture2D(uTexture, vTexCoords).rgb;
    vec3 diffuseColor = albedo * lambert;

    gl_FragColor = vec4(diffuseColor, 1.0);
}
