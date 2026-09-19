precision mediump float;

uniform vec3 uLightPosition;
uniform sampler2D uTexture;
uniform vec3 uMoonPosition;
uniform float uMoonRadius;

varying vec2 vTexCoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
    vec3 normalDirection = normalize(uLightPosition - vWorldPosition);
    vec3 worldNormal = normalize(vWorldNormal);
    float lambert = max(0.0, dot(worldNormal, normalDirection));

    vec3 albedo = texture2D(uTexture, vTexCoords).rgb;
    vec3 alphaColor = albedo * lambert;

    //This shouldn't be necessary since I'm not checking for self-collision anyways, but I included it
    //as it was something I tried when checking
    vec3 rayStartPosition = vWorldPosition + 0.0001 * normalDirection;
    //if(b^2 - 4 AC) == 0, 1 intersection
    //if > 0, 2 intersections
    float A = pow(normalDirection.x, 2.0) + pow(normalDirection.y, 2.0) + pow(normalDirection.z, 2.0);
    float B = 2.0 * (normalDirection.x * (rayStartPosition.x - uMoonPosition.x) +
    normalDirection.y * (rayStartPosition.y - uMoonPosition.y) +
    normalDirection.z * (rayStartPosition.z - uMoonPosition.z));
    float C = pow(rayStartPosition.x - uMoonPosition.x, 2.0) + pow(rayStartPosition.y - uMoonPosition.y, 2.0) +
    pow(rayStartPosition.z - uMoonPosition.z, 2.0) - pow(uMoonRadius, 2.0);
    float discriminant = pow(B, 2.0) - 4.0 * A * C;


    vec3 finalColor = vec3(1.0, 1.0, 1.0);
    if(discriminant >= 0.0){
        if(((-B + sqrt(discriminant)) / (2.0 * A)) > 0.0){
            finalColor = finalColor / 2.0;
        }
    }


    //This only takes R technically, but it's fine for a black-white alpha map.
    gl_FragColor = vec4(finalColor, alphaColor.rgb);
}
