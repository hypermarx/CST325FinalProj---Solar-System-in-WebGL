precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;
uniform sampler2D uSpecTexture;
uniform vec3 uMoonPosition;
uniform float uMoonRadius;

varying vec2 vTexCoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vSpecTexCoords;

void main() {
    vec3 normalDirection = normalize(uLightPosition - vWorldPosition);
    vec3 worldNormal = normalize(vWorldNormal);

    vec3 toEye = normalize(uCameraPosition - vWorldPosition);
    vec3 reflection = reflect(-normalDirection, worldNormal);

    float lambert = max(0.0, dot(worldNormal, normalDirection));

    vec3 albedo = texture2D(uTexture, vTexCoords).rgb;
    vec3 specular = texture2D(uSpecTexture, vSpecTexCoords).rgb;
    vec3 diffuseColor = albedo * lambert;

    float specularIntensity = pow(max(dot(reflection, toEye), 0.0), 8.0) * specular.r;
    vec3 specularColor = specularIntensity * vec3(0.902, 0.674, 0.063);

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


    vec3 finalColor = diffuseColor + specularColor;
    if(discriminant >= 0.0){
        if(((-B + sqrt(discriminant)) / (2.0 * A)) > 0.0){
            finalColor = finalColor / 2.0;
        }
    }

    gl_FragColor = vec4(finalColor, 1.0);
}
