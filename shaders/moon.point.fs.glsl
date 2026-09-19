precision mediump float;

uniform vec3 uLightPosition;
uniform sampler2D uTexture;
uniform vec3 uEarthPosition;
uniform float uEarthRadius;

varying vec2 vTexCoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
    vec3 normalDirection = normalize(uLightPosition - vWorldPosition);
    vec3 worldNormal = normalize(vWorldNormal);

    float lambert = max(0.0, dot(worldNormal, normalDirection));

    vec3 albedo = texture2D(uTexture, vTexCoords).rgb;
    vec3 diffuseColor = albedo * lambert;

    vec3 rayStartPosition = vWorldPosition + 0.0001 * normalDirection;
    //if(b^2 - 4 AC) == 0, 1 intersection
    //if > 0, 2 intersections
    float A = pow(normalDirection.x, 2.0) + pow(normalDirection.y, 2.0) + pow(normalDirection.z, 2.0);
    float B = 2.0 * (normalDirection.x * (rayStartPosition.x - uEarthPosition.x) +
    normalDirection.y * (rayStartPosition.y - uEarthPosition.y) +
    normalDirection.z * (rayStartPosition.z - uEarthPosition.z));
    float C = pow(rayStartPosition.x - uEarthPosition.x, 2.0) + pow(rayStartPosition.y - uEarthPosition.y, 2.0) +
    pow(rayStartPosition.z - uEarthPosition.z, 2.0) - pow(uEarthRadius, 2.0);
    float discriminant = pow(B, 2.0) - 4.0 * A * C;
    
    if(discriminant >= 0.0){
        if(((-B + sqrt(discriminant)) / (2.0 * A)) > 0.0){
            //Significantly darken moon if occluded by Earth
            diffuseColor = diffuseColor * 0.25;
        }
    }
    
    gl_FragColor = vec4(diffuseColor, 1.0);
}