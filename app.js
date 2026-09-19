let gl;

const appInput = new Input();
const time = new Time();
const camera = new OrbitCamera(appInput);
const assetLoader = new AssetLoader();
let planetOrbit = false;

let sunGeometry = null;
let skybox = null;
let mercuryGeometry = null;
let venusGeometry = null;
let earthGeometry = null;
let atmosphereGeometry = null;
let moonGeometry = null;
let marsGeometry = null;
let jupiterGeometry = null;
let saturnGeometry = null;
let uranusGeometry = null;
let neptuneGeometry = null;

let doSkybox = true;
let timeMod = 1.0;
let i = 3; //planet selector for orbit cam
let specularTexture;

const projectionMatrix = new Matrix4();
const lightPosition = new Vector4(4, 1.5, 0, 0);

//shader that will be used by each piece of geometry
let flatShaderProgram;
let skyboxShaderProgram;
let planetShaderProgram;
let atmosphereShaderProgram;
let earthShaderProgram;
let moonShaderProgram;

// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// List of assets to load
const assetList = [
    { name: 'sphereJSON', url: './data/sphere.json', type: 'json' },
    { name: 'sunTex', url: './data/sun.jpg', type: 'image'},

    { name: "GalaxyTex_NegativeX", url: './data/GalaxyTex_NegativeX.png', type: 'image'},
    { name: "GalaxyTex_NegativeY", url: './data/GalaxyTex_NegativeY.png', type: 'image'},
    { name: "GalaxyTex_NegativeZ", url: './data/GalaxyTex_NegativeZ.png', type: 'image'},
    { name: "GalaxyTex_PositiveX", url: './data/GalaxyTex_PositiveX.png', type: 'image'},
    { name: "GalaxyTex_PositiveY", url: './data/GalaxyTex_PositiveY.png', type: 'image'},
    { name: "GalaxyTex_PositiveZ", url: './data/GalaxyTex_PositiveZ.png', type: 'image'},

    { name: "mercuryTex", url: './data/mercury.jpg', type: 'image'},
    { name: "venusTex", url: './data/venusAt.jpg', type: 'image'},
    { name: "earthTex", url: './data/2k_earth_daymap.jpg', type: 'image'},
    { name: "earthSpecularMap", url: './data/2k_earth_specularmap.jpg', type: 'image'},
    { name: "atmosphereTex", url: './data/2k_earth_clouds.jpg', type: 'image'},
    { name: "moonTex", url: './data/moon.png', type: 'image'},
    { name: "marsTex", url: './data/mars.jpg', type: 'image'},
    { name: "jupiterTex", url: './data/jupiter.jpg', type: 'image'},
    { name: "saturnTex", url: './data/saturn.jpg', type: 'image'},
    { name: "uranusTex", url: './data/uranus.jpg', type: 'image'},
    { name: "neptuneTex", url: './data/neptune.jpg', type: 'image'},


    { name: 'flatTextVS', url: './shaders/flat.color.vs.glsl', type: 'text'},
    { name: 'flatTextFS', url: './shaders/flat.color.fs.glsl', type: 'text'},
    { name: 'skyboxTextVS', url: './shaders/skybox.vs.glsl', type: 'text'},
    { name: 'skyboxTextFS', url: './shaders/skybox.fs.glsl', type: 'text'},
    { name: 'planetTextVS', url: './shaders/planet.point.vs.glsl', type: 'text'},
    { name: 'planetTextFS', url: './shaders/planet.point.fs.glsl', type: 'text'},
    { name: 'atmosphereTextVS', url: './shaders/atmosphere.vs.glsl', type: 'text'},
    { name: 'atmosphereTextFS', url: './shaders/atmosphere.fs.glsl', type: 'text'},
    { name: 'earthTextVS', url: './shaders/earth.phong.vs.glsl', type: 'text'},
    { name: 'earthTextFS', url: './shaders/earth.phong.fs.glsl', type: 'text'},
    { name: 'moonTextVS', url: './shaders/moon.point.vs.glsl', type: 'text'},
    { name: 'moonTextFS', url: './shaders/moon.point.fs.glsl', type: 'text'}
];

//-------------------------------------------------------------------------------------------------

async function initializeAndStartRendering() {
    gl = getWebGLContext("webgl-canvas");
    gl.enable(gl.DEPTH_TEST);

    await assetLoader.loadAssets(assetList);

    createShaders();
    createScene();

    updateAndRender();
}

//-------------------------------------------------------------------------------------------------

function createShaders(){
    const flatTextFS = assetLoader.assets.flatTextFS;
    const flatTextVS = assetLoader.assets.flatTextVS;

    flatShaderProgram = createCompiledAndLinkedShaderProgram(gl, flatTextVS, flatTextFS);

    flatShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(flatShaderProgram, "aVertexPosition"),
        vertexTexcoordsAttribute: gl.getAttribLocation(flatShaderProgram, "aTexCoords")
    };

    flatShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(flatShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(flatShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(flatShaderProgram, "uProjectionMatrix"),
        textureUniform: gl.getUniformLocation(flatShaderProgram, "uTexture"),
    };

    const skyboxTextVS = assetLoader.assets.skyboxTextVS;
    const skyboxTextFS = assetLoader.assets.skyboxTextFS;
    skyboxShaderProgram = createCompiledAndLinkedShaderProgram(gl, skyboxTextVS, skyboxTextFS);

    skyboxShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(skyboxShaderProgram, "aVertexPosition")
    };

    skyboxShaderProgram.uniforms = {
        viewDirectionProjectionInverseUniform: gl.getUniformLocation(skyboxShaderProgram, "uViewDirectionProjectionInv"),
        textureUniform: gl.getUniformLocation(skyboxShaderProgram, "uTexture")
    };

    const planetTextVS = assetLoader.assets.planetTextVS;
    const planetTextFS = assetLoader.assets.planetTextFS;
    planetShaderProgram = createCompiledAndLinkedShaderProgram(gl, planetTextVS, planetTextFS);

    planetShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(planetShaderProgram,"aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(planetShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(planetShaderProgram, "aTexCoords")
    }

    planetShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(planetShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(planetShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(planetShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(planetShaderProgram, "uLightPosition"),
        textureUniform: gl.getUniformLocation(planetShaderProgram, "uTexture"),
    }

    const atmosphereTextVS = assetLoader.assets.atmosphereTextVS;
    const atmosphereTextFS = assetLoader.assets.atmosphereTextFS;
    atmosphereShaderProgram = createCompiledAndLinkedShaderProgram(gl, atmosphereTextVS, atmosphereTextFS);

    atmosphereShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(atmosphereShaderProgram,"aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(atmosphereShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(atmosphereShaderProgram, "aTexCoords")
    }

    atmosphereShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(atmosphereShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(atmosphereShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(atmosphereShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(atmosphereShaderProgram, "uLightPosition"),
        textureUniform: gl.getUniformLocation(atmosphereShaderProgram, "uTexture"),
        moonPositionUniform: gl.getUniformLocation(atmosphereShaderProgram, "uMoonPosition"),
        moonRadiusUniform: gl.getUniformLocation(atmosphereShaderProgram, "uMoonRadius")
    }

    const earthTextVS = assetLoader.assets.earthTextVS;
    const earthTextFS = assetLoader.assets.earthTextFS;
    earthShaderProgram = createCompiledAndLinkedShaderProgram(gl, earthTextVS, earthTextFS);
    earthShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(earthShaderProgram,"aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(earthShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(earthShaderProgram, "aTexCoords"),
        vertexSpecularTexcoordsAttribute: gl.getAttribLocation(earthShaderProgram, "aSpecTexCoords")
    }

    earthShaderProgram.uniforms = {
        cameraPositionUniform: gl.getUniformLocation(earthShaderProgram, "uCameraPosition"),
        worldMatrixUniform: gl.getUniformLocation(earthShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(earthShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(earthShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(earthShaderProgram, "uLightPosition"),
        textureUniform: gl.getUniformLocation(earthShaderProgram, "uTexture"),
        specularTextureUniform: gl.getUniformLocation(earthShaderProgram, "uSpecTexture"),
        moonPositionUniform: gl.getUniformLocation(earthShaderProgram, "uMoonPosition"),
        moonRadiusUniform: gl.getUniformLocation(earthShaderProgram, "uMoonRadius")
    }
    
    const moonTextVS = assetLoader.assets.moonTextVS;
    const moonTextFS = assetLoader.assets.moonTextFS;
    moonShaderProgram = createCompiledAndLinkedShaderProgram(gl, moonTextVS, moonTextFS);
    
    moonShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(moonShaderProgram,"aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(moonShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(moonShaderProgram, "aTexCoords")
    }
    
    moonShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(moonShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(moonShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(moonShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(moonShaderProgram, "uLightPosition"),
        textureUniform: gl.getUniformLocation(moonShaderProgram, "uTexture"),
        earthPositionUniform: gl.getUniformLocation(moonShaderProgram, "uEarthPosition"),
        earthRadiusUniform: gl.getUniformLocation(moonShaderProgram, "uEarthRadius")
    }
}

//-------------------------------------------------------------------------------------------------

function createScene(){

    sunGeometry = new WebGLGeometryJSON(gl, flatShaderProgram);
    sunGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.sunTex);

    skybox = new WebGLGeometryQuad(gl, skyboxShaderProgram);
    skybox.createCubeMap(
        assetLoader.assets.GalaxyTex_NegativeX,
        assetLoader.assets.GalaxyTex_NegativeY,
        assetLoader.assets.GalaxyTex_NegativeZ,
        assetLoader.assets.GalaxyTex_PositiveX,
        assetLoader.assets.GalaxyTex_PositiveY,
        assetLoader.assets.GalaxyTex_PositiveZ,
    );

    let scale = new Matrix4().makeScale(0.18, 0.18, 0.18);
    sunGeometry.worldMatrix.makeIdentity();
    sunGeometry.worldMatrix.multiply(scale);

    mercuryGeometry = new WebGLGeometryJSON(gl, planetShaderProgram);
    mercuryGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.mercuryTex);

    venusGeometry = new WebGLGeometryJSON(gl, planetShaderProgram);
    venusGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.venusTex);

    earthGeometry = new WebGLGeometryJSON(gl, earthShaderProgram);
    earthGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.earthTex);

    atmosphereGeometry = new WebGLGeometryJSON(gl, planetShaderProgram);
    atmosphereGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.atmosphereTex);

    moonGeometry = new WebGLGeometryJSON(gl, moonShaderProgram);
    moonGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.moonTex);

    marsGeometry = new WebGLGeometryJSON(gl, planetShaderProgram);
    marsGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.marsTex);

    jupiterGeometry = new WebGLGeometryJSON(gl, planetShaderProgram);
    jupiterGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.jupiterTex);

    saturnGeometry = new WebGLGeometryJSON(gl, planetShaderProgram);
    saturnGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.saturnTex);

    uranusGeometry = new WebGLGeometryJSON(gl, planetShaderProgram);
    uranusGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.uranusTex);

    neptuneGeometry = new WebGLGeometryJSON(gl, planetShaderProgram);
    neptuneGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.neptuneTex);


    specularTexture = create2DTexture(gl, assetLoader.assets.earthSpecularMap);
}

//-------------------------------------------------------------------------------------------------

let modTime = 0;

function updateAndRender(){
    requestAnimationFrame(updateAndRender);

    const aspectRatio = gl.canvasWidth / gl.canvasHeight;

    //Time modifier cannot go negative. Time modifier cannot go above 10.
    timeMod = Math.max(0, timeMod);
    timeMod = Math.min(10, timeMod);

    time.update();
    camera.update(time.deltaTime);

    //Used instead of time so changing the multiplier allows easy change of the speed of all movements in scene
    //If anything is too fast lower this as desired to get a closer look. Earth rotates really fast at base modTime.
    modTime += time.deltaTime * timeMod;

    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    //Clear out last frame
    gl.clearColor(0, 1, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(skyboxShaderProgram);

    if(doSkybox) {
        gl.disable(gl.DEPTH_TEST);
        skybox.renderSkybox(camera, projectionMatrix, skyboxShaderProgram);
        gl.enable(gl.DEPTH_TEST);
    }

    gl.useProgram(flatShaderProgram);
    const cameraPosition = camera.getPosition();
    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);

    //Rotate sun
    const sunRotation = new Matrix4().makeRotationY(12 * modTime);

    sunGeometry.worldMatrix.makeIdentity().multiply(sunRotation).multiply(
        new Matrix4().makeScale(0.18, 0.18, 0.18)
    );
    sunGeometry.render(camera, projectionMatrix, flatShaderProgram);

    //----------------------------------------- PLANETS ---------------------------------------------

    gl.useProgram(planetShaderProgram);
    let uniforms = planetShaderProgram.uniforms;
    const lightPos = new Vector3();
    gl.uniform3f(uniforms.lightPositionUniform, lightPos.x, lightPos.y, lightPos.z);

    //----------------MERCURY---------------------

    //Makes Mercury complete approximately 1.5 rotations within one orbit.
    //Orbit should be 2pi / 0.4 = 5pi seconds
    //So the rotation is 540 / 5 pi degrees/seconds, or 34.3 degrees / second.
    let planetRotation = new Matrix4().makeRotationY(34.3 * modTime);
    //Mercury rotates around the sun slowly, hence the 0.2 modifier to time.
    let planetTranslation = new Matrix4().makeTranslation(
        12 * (Math.sin(0.4 * modTime)),
        0,
        12 * (Math.cos(0.4 * modTime)));
    mercuryGeometry.worldMatrix.makeIdentity().multiply(planetTranslation).multiply(planetRotation)
        .multiply(new Matrix4().makeScale(0.004, 0.004, 0.004));
    mercuryGeometry.render(camera, projectionMatrix, planetShaderProgram);

    //----------------VENUS---------------------

    //Venus: 3x Mercury's size. 2.5x slower year than Mercury. Rotation about half
    //Rotates retrograde
    planetRotation = new Matrix4().makeRotationY(-17 * modTime);
    planetTranslation = new Matrix4().makeTranslation(
        24 * (Math.sin(0.4 / 2.5 * modTime)),
        0,
        24 * (Math.cos(0.4 / 2.5 * modTime))
    );

    venusGeometry.worldMatrix.makeIdentity().multiply(planetTranslation).multiply(planetRotation)
        .multiply(new Matrix4().makeScale(0.012, 0.012, 0.012));
    venusGeometry.render(camera, projectionMatrix, planetShaderProgram);

    //----------------EARTH---------------------

    //Slightly bigger than Venus. 4.15x slower year than mercury.
    //Rotates 360 * 365 / (2pi / (0.4 / 4.15)) degrees / second
    planetRotation = new Matrix4().makeRotationY(2015.7 * modTime);
    planetTranslation = new Matrix4().makeTranslation(
        30.96 * Math.sin(0.4 / 4.15 * modTime),
        0,
        30.96 * Math.cos(0.4 / 4.15 * modTime),
    );
    let axisTilt = new Matrix4().makeRotationX(-23.5)

    earthGeometry.worldMatrix.makeIdentity().multiply(planetTranslation).multiply(axisTilt).multiply(planetRotation)
        .multiply(new Matrix4().makeScale(0.0126, 0.0126, 0.0126));

    earthGeometry.render(camera, projectionMatrix, earthShaderProgram);
    gl.useProgram(earthShaderProgram);
    uniforms = earthShaderProgram.uniforms;
    //Set uniforms for earth shader
    gl.uniform3f(uniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, specularTexture);
    gl.uniform1i(uniforms.specularTextureUniform, 1);

    //------------------Atmosphere-------------------

    //Atmosphere is higher than it would be realistically for visibility.
    atmosphereGeometry.worldMatrix.makeIdentity().multiply(planetTranslation).multiply(axisTilt).multiply(planetRotation).
        multiply(new Matrix4().makeScale(0.01323, 0.01323, 0.01323))

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    atmosphereGeometry.render(camera, projectionMatrix, atmosphereShaderProgram);
    //AtmosphereShaderProgram never has its lightPos uniform set, but I think it works because it defaults to 0,0,0

    //----------------MOON---------------------

    //Tidally locked- Orbit speed matches rotation speed.
    //Orbit speed is 27 earth days -> 1 moon orbit
    //A slightly complex formula led me to: Earth takes 4.82 seconds to complete 27 rotations,
    //so my orbit speed has to be 2pi / 4.82.
    //Rotation speed in degrees: 360 / time orbit takes in seconds
    //Rotate -> translate to Earth -> translate around Earth -> scale -> profit?
    let earthTranslation = planetTranslation.clone();


    planetRotation = new Matrix4().makeRotationY(74.63);
    planetTranslation = new Matrix4().makeTranslation(
        2 * Math.sin(1.303 * modTime),
        0,
        2 * Math.cos(1.303 * modTime),
    );

    moonGeometry.worldMatrix.makeIdentity().multiply(planetTranslation).multiply(earthTranslation).multiply(planetRotation)
        .multiply(new Matrix4().makeScale(0.004 / 1.4, 0.004 / 1.4, 0.004 / 1.4));

    //Send the moon the Earth position uniforms
    gl.useProgram(moonShaderProgram);
    uniforms = moonShaderProgram.uniforms;
    gl.uniform3f(uniforms.earthPositionUniform,
        earthGeometry.worldMatrix.elements[3], earthGeometry.worldMatrix.elements[7], earthGeometry.worldMatrix.elements[11]);
    gl.uniform1f(uniforms.earthRadiusUniform, (0.2 * 1.4));

    moonGeometry.render(camera, projectionMatrix, moonShaderProgram);

    //Send earth the moon position uniform
    gl.useProgram(earthShaderProgram);
    uniforms = earthShaderProgram.uniforms;
    gl.uniform3f(uniforms.moonPositionUniform,
        moonGeometry.worldMatrix.elements[3], moonGeometry.worldMatrix.elements[7], moonGeometry.worldMatrix.elements[11]);
    gl.uniform1f(uniforms.moonRadiusUniform, (0.2));
    //Send atmosphere the moon position uniform

    gl.useProgram(atmosphereShaderProgram);
    uniforms = atmosphereShaderProgram.uniforms;
    gl.uniform3f(uniforms.moonPositionUniform,
        moonGeometry.worldMatrix.elements[3], moonGeometry.worldMatrix.elements[7], moonGeometry.worldMatrix.elements[11]);
    gl.uniform1f(uniforms.moonRadiusUniform, (0.2));
    //Arbitrary radius set through trial and error, since I couldn't verify the default radius of an unscaled
    //sphereJSON was 1.

    //----------------MARS---------------------
    //Scale: Half of earth. Orbit modifier: (Earth/1.88). Rotation speed: 0.975 * Earth
    //Distance from Sun: 4.7x Mercury's

    planetRotation = new Matrix4().makeRotationY(72.76);
    planetTranslation = new Matrix4().makeTranslation(
        56.4 * Math.sin(0.0513 * modTime),
        0,
        56.4 * Math.cos(0.0513 * modTime)
    );
    marsGeometry.worldMatrix.makeIdentity().multiply(planetTranslation).multiply(planetRotation)
        .multiply(new Matrix4().makeScale(0.0063, 0.0063, 0.0063));

    marsGeometry.render(camera, projectionMatrix, planetShaderProgram);

    //----------------JUPITER---------------------
    //Scale: 11x earth. Orbit modifier: (Earth/11.86) Rotation speed: 2.4x Earth
    //Distance from Sun: 16.13x Mercury's

    planetRotation = new Matrix4().makeRotationY(4837.68 * modTime);
    planetTranslation = new Matrix4().makeTranslation(
        193.56 * Math.sin(0.0081 * modTime),
    0,
        193.56 * Math.cos(0.0081 * modTime)
    );

    jupiterGeometry.worldMatrix.makeIdentity().multiply(planetTranslation).multiply(planetRotation).
    multiply(new Matrix4().makeScale(0.1386, 0.1386, 0.1386));

    jupiterGeometry.render(camera, projectionMatrix, planetShaderProgram);

    //----------------SATURN---------------------

    //Scale: 9.5x earth. Orbit modifier: (Earth/29.4) Rotation speed: 2.2x Earth
    //Distance from Sun: 24.6x Mercury's

    planetRotation = new Matrix4().makeRotationY(4434.54);
    planetTranslation = new Matrix4().makeTranslation(
        295.2 * Math.sin(0.003278 * modTime),
    0,
        295.2 * Math.cos(0.003278 * modTime)
    );

    saturnGeometry.worldMatrix.makeIdentity().multiply(planetTranslation).multiply(planetRotation).
    multiply(new Matrix4().makeScale(0.1197, 0.1197, 0.1197));

    saturnGeometry.render(camera, projectionMatrix, planetShaderProgram);

    //----------------URANUS---------------------

    //Scale: 4x earth. Orbit modifier: (Earth/84) Rotation speed: 1.39x Earth, retrograde
    //Distance from Sun: 50x Mercury's

    planetRotation = new Matrix4().makeRotationY(2801.823);
    planetTranslation = new Matrix4().makeTranslation(
        600 * Math.sin(0.00114 * modTime),
    0,
        600 * Math.cos(0.00114 * modTime)
    );

    uranusGeometry.worldMatrix.makeIdentity().multiply(planetTranslation).multiply(planetRotation).
    multiply(new Matrix4().makeScale(0.0504, 0.0504, 0.0504));

    uranusGeometry.render(camera, projectionMatrix, planetShaderProgram);

    //----------------NEPTUNE---------------------

    //Scale: 4x earth. Orbit modifier: (Earth/165) Rotation speed: 1.49x Earth
    //Distance from Sun: 77.78x Mercury's

    //MERCURY DISTANCE: 6
    //EARTH ORBIT MODIFIER: 0.4 / 4.15
    //EARTH ROTATION SPEED: 2015.7
    //EARTH SCALE: 0.0126

    planetRotation = new Matrix4().makeRotationY(3003.393);
    planetTranslation = new Matrix4().makeTranslation(
        933.36 * Math.sin(0.0006 * modTime),
    0,
    933.36 * Math.cos(0.0006 * modTime)
    );

    neptuneGeometry.worldMatrix.makeIdentity().multiply(planetTranslation).multiply(planetRotation).
    multiply(new Matrix4().makeScale(0.0504, 0.0504, 0.0504));

    neptuneGeometry.render(camera, projectionMatrix, planetShaderProgram);


    const planets = [
        sunGeometry.worldMatrix.elements,
        mercuryGeometry.worldMatrix.elements,
        venusGeometry.worldMatrix.elements,
        earthGeometry.worldMatrix.elements,
        marsGeometry.worldMatrix.elements,
        jupiterGeometry.worldMatrix.elements,
        saturnGeometry.worldMatrix.elements,
        uranusGeometry.worldMatrix.elements,
        neptuneGeometry.worldMatrix.elements,
    ]

    if(appInput.ePress){
        if(!planetOrbit){
            planetOrbit = true;
        }
        else{
            planetOrbit = false;
            const e = planets[0];
            camera.cameraTarget = new Vector4(e[3], e[7], e[11], 1);
            camera.minZoomScale = 0.5;
            camera.zoomScale = 1;
        }
    }
    if(planetOrbit){
        if(appInput.dPress) {
            if(i === 8){
                i = 1;
            }
            else {
                i++;
            }
        }
        if(appInput.aPress) {
            if(i === 1){
                i = 8;
            }
            else {
                i--;
            }
        }
        //Set zoom to appropriate level every time you change planets
        if(appInput.dPress || appInput.aPress || appInput.ePress){
            switch (i){
                case 1:
                    camera.zoomScale = 0.06;
                    break;
                case 2:
                    camera.zoomScale = 0.2;
                    break;
                case 3:
                    camera.zoomScale = 0.12;
                    break;
                case 4:
                    camera.zoomScale = 0.12;
                    break;
                case 5:
                    camera.zoomScale = 1.10;
                    break;
                case 6:
                    camera.zoomScale = 1;
                    break;
                case 7:
                    camera.zoomScale = 0.7;
                    break;
                case 8:
                    camera.zoomScale = 0.7;
                    break;
            }
        }
        const e = planets[i];
        camera.cameraTarget = new Vector4(e[3], e[7], e[11], 1);
        camera.minZoomScale = 0;
    }

    if(appInput.s){
        timeMod *= Math.pow(0.985, time.deltaTime * 60);
    }
    if(appInput.w){
        if(timeMod === 0){
            timeMod = 0.01;
        }
        else {
            timeMod *= Math.pow(1.015, time.deltaTime * 60);
        }
    }

    if(timeMod < 0.01){
        timeMod = 0;
    }

    appInput.aPress = appInput.dPress = appInput.ePress = false;
}