import * as THREE from "three";

/**
 * 模拟草地,但是引入文件的依赖关系不正确
 * https://al-ro.github.io/projects/grass/
 */
export class Grass {
    constructor(app) {
        this.app = app
    }

    add() {
        const self = this
        var width = 120;
        var resolution = 64;
        var delta = width / resolution;
        var pos = new THREE.Vector2(0.01, 0.01);
        var radius = 240;
        var speed = 3;
        var bladeHeight = 1;
        var joints = 4;
        var bladeWidth = 0.12;
        var instances = 40000;
        var azimuth = 0.4;
        var elevation = 0.2;
        var viewDirection = new THREE.Vector3();

        var ambientStrength = 0.7;
        var translucencyStrength = 1.5;
        var specularStrength = 0.5;
        var diffuseStrength = 1.5;
        var shininess = 256;
        var sunColour = new THREE.Vector3(1.0, 1.0, 1.0);
        var specularColour = new THREE.Vector3(1.0, 1.0, 1.0);


        var loader = new THREE.TextureLoader();
        loader.crossOrigin = '';
        var grassTexture = loader.load('https://al-ro.github.io/images/grass/blade_diffuse.jpg');
        var alphaMap = loader.load('https://al-ro.github.io/images/grass/blade_alpha.jpg');
        var noiseTexture = loader.load('https://al-ro.github.io/images/grass/perlinFbm.jpg');
        noiseTexture.wrapS = THREE.RepeatWrapping;
        noiseTexture.wrapT = THREE.RepeatWrapping;

        var groundBaseGeometry = new THREE.PlaneBufferGeometry(width, width, resolution, resolution);
        groundBaseGeometry.lookAt(new THREE.Vector3(0, 1, 0));
        groundBaseGeometry.verticesNeedUpdate = true;

        var groundGeometry = new THREE.PlaneBufferGeometry(width, width, resolution, resolution);

        groundGeometry.setAttribute('basePosition', groundBaseGeometry.getAttribute("position"));
        groundGeometry.lookAt(new THREE.Vector3(0, 1, 0));
        groundGeometry.verticesNeedUpdate = true;
        var groundMaterial = new THREE.MeshPhongMaterial({color: 0x000900});

        var sharedPrefix = `
        uniform sampler2D noiseTexture;
        float getYPosition(vec2 p){
            return 8.0*(2.0*texture2D(noiseTexture, p/800.0).r - 1.0);
        }
        `;

        var groundVertexPrefix = sharedPrefix + `
attribute vec3 basePosition;
uniform float delta;
uniform float posX;
uniform float posZ;
uniform float radius;
uniform float width;

float placeOnSphere(vec3 v){
  float theta = acos(v.z/radius);
  float phi = acos(v.x/(radius * sin(theta)));
  float sV = radius * sin(theta) * sin(phi);
  //If undefined, set to default value
  if(sV != sV){
    sV = v.y;
  }
  return sV;
}

//Get the position of the ground from the [x,z] coordinates, the sphere and the noise height field
vec3 getPosition(vec3 pos, float epsX, float epsZ){
  vec3 temp;
  temp.x = pos.x + epsX;
  temp.z = pos.z + epsZ;
  temp.y = max(0.0, placeOnSphere(temp)) - radius;
  temp.y += getYPosition(vec2(basePosition.x+epsX+delta*floor(posX), basePosition.z+epsZ+delta*floor(posZ)));
  return temp;
}

//Find the normal at pos as the cross product of the central-differences in x and z directions
vec3 getNormal(vec3 pos){
  float eps = 1e-1;

  vec3 tempP = getPosition(pos, eps, 0.0);
  vec3 tempN = getPosition(pos, -eps, 0.0);

  vec3 slopeX = tempP - tempN;

  tempP = getPosition(pos, 0.0, eps);
  tempN = getPosition(pos, 0.0, -eps);

  vec3 slopeZ = tempP - tempN;

  vec3 norm = normalize(cross(slopeZ, slopeX));
  return norm;
}
`;

        var groundShader;
        groundMaterial.onBeforeCompile = function (shader) {
            shader.uniforms.delta = {value: delta};
            shader.uniforms.posX = {value: pos.x};
            shader.uniforms.posZ = {value: pos.y};
            shader.uniforms.radius = {value: radius};
            shader.uniforms.width = {value: width};
            shader.uniforms.noiseTexture = {value: noiseTexture};
            shader.vertexShader = groundVertexPrefix + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <beginnormal_vertex>',
                `//https://dev.to/maurobringolf/a-neat-trick-to-compute-modulo-of-negative-numbers-111e
                        vec3 pos = vec3(0);
                  pos.x = basePosition.x - mod(mod((delta*posX),delta) + delta, delta);
                  pos.z = basePosition.z - mod(mod((delta*posZ),delta) + delta, delta);
                  pos.y = max(0.0, placeOnSphere(pos)) - radius;
                  pos.y += getYPosition(vec2(basePosition.x+delta*floor(posX), basePosition.z+delta*floor(posZ)));
                  vec3 objectNormal = getNormal(pos);
            #ifdef USE_TANGENT
                  vec3 objectTangent = vec3( tangent.xyz );
            #endif`
            );
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `vec3 transformed = vec3(pos);`
            );
            groundShader = shader;
        };

        var ground = new THREE.Mesh(groundGeometry, groundMaterial);

        ground.geometry.computeVertexNormals();
        this.app.scene.add(ground);

        //************** Grass **************
        var grassVertexSource = sharedPrefix + `
precision mediump float;
attribute vec3 position;
attribute vec3 normal;
attribute vec3 offset;
attribute vec2 uv;
attribute vec2 halfRootAngle;
attribute float scale;
attribute float index;
uniform float time;

uniform float delta;
uniform float posX;
uniform float posZ;
uniform float radius;
uniform float width;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float frc;
varying float idx;

const float PI = 3.1415;
const float TWO_PI = 2.0 * PI;


//https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
vec3 rotateVectorByQuaternion(vec3 v, vec4 q){
  return 2.0 * cross(q.xyz, v * q.w + cross(q.xyz, v)) + v;
}

float placeOnSphere(vec3 v){
  float theta = acos(v.z/radius);
  float phi = acos(v.x/(radius * sin(theta)));
  float sV = radius * sin(theta) * sin(phi);
  //If undefined, set to default value
  if(sV != sV){
    sV = v.y;
  }
  return sV;
}

void main() {

	//Vertex height in blade geometry
	frc = position.y / float(` + bladeHeight + `);

	//Scale vertices
  vec3 vPosition = position;
	vPosition.y *= scale;

	//Invert scaling for normals
	vNormal = normal;
	vNormal.y /= scale;

	//Rotate blade around Y axis
  vec4 direction = vec4(0.0, halfRootAngle.x, 0.0, halfRootAngle.y);
	vPosition = rotateVectorByQuaternion(vPosition, direction);
	vNormal = rotateVectorByQuaternion(vNormal, direction);

  //UV for texture
  vUv = uv;

	vec3 pos;
	vec3 globalPos;
	vec3 tile;

	globalPos.x = offset.x-posX*delta;
	globalPos.z = offset.z-posZ*delta;

	tile.x = floor((globalPos.x + 0.5 * width) / width);
	tile.z = floor((globalPos.z + 0.5 * width) / width);

	pos.x = globalPos.x - tile.x * width;
	pos.z = globalPos.z - tile.z * width;

	pos.y = max(0.0, placeOnSphere(pos)) - radius;
	pos.y += getYPosition(vec2(pos.x+delta*posX, pos.z+delta*posZ));

	//Position of the blade in the visible patch [0->1]
  vec2 fractionalPos = 0.5 + offset.xz / width;
  //To make it seamless, make it a multiple of 2*PI
  fractionalPos *= TWO_PI;

  //Wind is sine waves in time.
  float noise = sin(fractionalPos.x + time);
  float halfAngle = noise * 0.1;
  noise = 0.5 + 0.5 * cos(fractionalPos.y + 0.25 * time);
  halfAngle -= noise * 0.2;

	direction = normalize(vec4(sin(halfAngle), 0.0, -sin(halfAngle), cos(halfAngle)));

	//Rotate blade and normals according to the wind
  vPosition = rotateVectorByQuaternion(vPosition, direction);
	vNormal = rotateVectorByQuaternion(vNormal, direction);

	//Move vertex to global location
	vPosition += pos;

	//Index of instance for varying colour in fragment shader
	idx = index;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);

}`;

        var grassFragmentSource = `
precision mediump float;

uniform vec3 cameraPosition;

//Light uniforms
uniform float ambientStrength;
uniform float diffuseStrength;
uniform float specularStrength;
uniform float translucencyStrength;
uniform float shininess;
uniform vec3 lightColour;
uniform vec3 sunDirection;


//Surface uniforms
uniform sampler2D map;
uniform sampler2D alphaMap;
uniform vec3 specularColour;

varying float frc;
varying float idx;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

vec3 ACESFilm(vec3 x){
	float a = 2.51;
	float b = 0.03;
	float c = 2.43;
	float d = 0.59;
	float e = 0.14;
	return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

void main() {

  //If transparent, don't draw
  if(texture2D(alphaMap, vUv).r < 0.15){
    discard;
  }

	vec3 normal;

	//Flip normals when viewing reverse of the blade
	if(gl_FrontFacing){
		normal = normalize(vNormal);
	}else{
		normal = normalize(-vNormal);
	}

  //Get colour data from texture
	vec3 textureColour = pow(texture2D(map, vUv).rgb, vec3(2.2));

  //Add different green tones towards root
	vec3 mixColour = idx > 0.75 ? vec3(0.07, 0.52, 0.06) : vec3(0.07, 0.43, 0.08);
  textureColour = mix(pow(mixColour, vec3(2.2)), textureColour, frc);

	vec3 lightTimesTexture = lightColour * textureColour;
  vec3 ambient = textureColour;
	vec3 lightDir = normalize(sunDirection);

  //How much a fragment faces the light
	float dotNormalLight = dot(normal, lightDir);
  float diff = max(dotNormalLight, 0.0);

  //Colour when lit by light
  vec3 diffuse = diff * lightTimesTexture;

  float sky = max(dot(normal, vec3(0,1,0)), 0.0);
	vec3 skyLight = sky * vec3(0.12, 0.29, 0.55);

  vec3 viewDirection = normalize(cameraPosition - vPosition);
  vec3 halfwayDir = normalize(lightDir + viewDirection);
  //How much a fragment directly reflects the light to the camera
  float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);

  //Colour of light sharply reflected into the camera
  vec3 specular = spec * specularColour * lightColour;

	//https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Translucent_Surfaces
	vec3 diffuseTranslucency = vec3(0);
	vec3 forwardTranslucency = vec3(0);
	float dotViewLight = dot(-lightDir, viewDirection);
	if(dotNormalLight <= 0.0){
		diffuseTranslucency = lightTimesTexture * translucencyStrength * -dotNormalLight;
		if(dotViewLight > 0.0){
			forwardTranslucency = lightTimesTexture * translucencyStrength * pow(dotViewLight, 16.0);
		}
	}

  vec3 col = 0.3 * skyLight * textureColour + ambientStrength * ambient + diffuseStrength * diffuse + specularStrength * specular + diffuseTranslucency + forwardTranslucency;

  //Tonemapping
  col = ACESFilm(col);

  //Gamma correction 1.0/2.2 = 0.4545...
	col = pow(col, vec3(0.4545));

	//Add a shadow towards root
	col = mix(vec3(0.0, 0.2, 0.0), col, frc);

  gl_FragColor = vec4(col, 1.0);
}`;
        var grassBaseGeometry = new THREE.PlaneBufferGeometry(bladeWidth, bladeHeight, 1, joints);
        grassBaseGeometry.translate(0, bladeHeight / 2, 0);

        let vertex = new THREE.Vector3();
        let quaternion0 = new THREE.Quaternion();
        let quaternion1 = new THREE.Quaternion();
        let x, y, z, w, angle, sinAngle, rotationAxis;

        //Rotate around Y
        angle = 0.05;
        sinAngle = Math.sin(angle / 2.0);
        rotationAxis = new THREE.Vector3(0, 1, 0);
        x = rotationAxis.x * sinAngle;
        y = rotationAxis.y * sinAngle;
        z = rotationAxis.z * sinAngle;
        w = Math.cos(angle / 2.0);
        quaternion0.set(x, y, z, w);

        //Rotate around X
        angle = 0.3;
        sinAngle = Math.sin(angle / 2.0);
        rotationAxis.set(1, 0, 0);
        x = rotationAxis.x * sinAngle;
        y = rotationAxis.y * sinAngle;
        z = rotationAxis.z * sinAngle;
        w = Math.cos(angle / 2.0);
        quaternion1.set(x, y, z, w);

        quaternion0.multiply(quaternion1);

        angle = 0.1;
        sinAngle = Math.sin(angle / 2.0);
        rotationAxis.set(0, 0, 1);
        x = rotationAxis.x * sinAngle;
        y = rotationAxis.y * sinAngle;
        z = rotationAxis.z * sinAngle;
        w = Math.cos(angle / 2.0);
        quaternion1.set(x, y, z, w);

        //Combine rotations to a single quaternion
        quaternion0.multiply(quaternion1);

        let quaternion2 = new THREE.Quaternion();

        //Bend grass base geometry for more organic look
        for (let v = 0; v < grassBaseGeometry.attributes.position.array.length; v += 3) {
            quaternion2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
            vertex.x = grassBaseGeometry.attributes.position.array[v];
            vertex.y = grassBaseGeometry.attributes.position.array[v + 1];
            vertex.z = grassBaseGeometry.attributes.position.array[v + 2];
            let frac = vertex.y / bladeHeight;
            quaternion2.slerp(quaternion0, frac);
            vertex.applyQuaternion(quaternion2);
            grassBaseGeometry.attributes.position.array[v] = vertex.x;
            grassBaseGeometry.attributes.position.array[v + 1] = vertex.y;
            grassBaseGeometry.attributes.position.array[v + 2] = vertex.z;
        }

        grassBaseGeometry.computeVertexNormals();
        var baseMaterial = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
        var baseBlade = new THREE.Mesh(grassBaseGeometry, baseMaterial);

        var instancedGeometry = new THREE.InstancedBufferGeometry();
        instancedGeometry.index = grassBaseGeometry.index;
        instancedGeometry.attributes.position = grassBaseGeometry.attributes.position;
        instancedGeometry.attributes.uv = grassBaseGeometry.attributes.uv;
        instancedGeometry.attributes.normal = grassBaseGeometry.attributes.normal;
        var indices = [];
        var offsets = [];
        var scales = [];
        var halfRootAngles = [];

        for (let i = 0; i < instances; i++) {

            indices.push(i / instances);

            //Offset of the roots
            x = Math.random() * width - width / 2;
            z = Math.random() * width - width / 2;
            y = 0;
            offsets.push(x, y, z);

            //Random orientation
            let angle = Math.PI - Math.random() * (2 * Math.PI);
            halfRootAngles.push(Math.sin(0.5 * angle), Math.cos(0.5 * angle));

            //Define variety in height
            if (i % 3 != 0) {
                scales.push(2.0 + Math.random() * 1.25);
            } else {
                scales.push(2.0 + Math.random());
            }
        }

        var offsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3);
        var scaleAttribute = new THREE.InstancedBufferAttribute(new Float32Array(scales), 1);
        var halfRootAngleAttribute = new THREE.InstancedBufferAttribute(new Float32Array(halfRootAngles), 2);
        var indexAttribute = new THREE.InstancedBufferAttribute(new Float32Array(indices), 1);

        instancedGeometry.setAttribute('offset', offsetAttribute);
        instancedGeometry.setAttribute('scale', scaleAttribute);
        instancedGeometry.setAttribute('halfRootAngle', halfRootAngleAttribute);
        instancedGeometry.setAttribute('index', indexAttribute);
//Define the material, specifying attributes, uniforms, shaders etc.
        var grassMaterial = new THREE.RawShaderMaterial({
            uniforms: {
                time: {type: 'float', value: 0},
                delta: {type: 'float', value: delta},
                posX: {type: 'float', value: pos.x},
                posZ: {type: 'float', value: pos.y},
                radius: {type: 'float', value: radius},
                width: {type: 'float', value: width},
                map: {value: grassTexture},
                alphaMap: {value: alphaMap},
                noiseTexture: {value: noiseTexture},
                sunDirection: {
                    type: 'vec3',
                    value: new THREE.Vector3(Math.sin(azimuth), Math.sin(elevation), -Math.cos(azimuth))
                },
                cameraPosition: {type: 'vec3', value: this.app.camera.position},
                ambientStrength: {type: 'float', value: ambientStrength},
                translucencyStrength: {type: 'float', value: translucencyStrength},
                diffuseStrength: {type: 'float', value: diffuseStrength},
                specularStrength: {type: 'float', value: specularStrength},
                shininess: {type: 'float', value: shininess},
                lightColour: {type: 'vec3', value: sunColour},
                specularColour: {type: 'vec3', value: specularColour},
            },
            vertexShader: grassVertexSource,
            fragmentShader: grassFragmentSource,
            side: THREE.DoubleSide
        });

        var grass = new THREE.Mesh(instancedGeometry, grassMaterial);
        this.app.scene.add(grass);
        grass.scale.set(0.4,0.4,0.4)
        grass.position.set(54, 6, -48)

        function updateSunPosition() {
            var sunDirection = new THREE.Vector3(Math.sin(azimuth), Math.sin(elevation), -Math.cos(azimuth));
            grassMaterial.uniforms.sunDirection.value = sunDirection;
            backgroundMaterial.uniforms.sunDirection.value = sunDirection;
        }

//************** Draw **************
//************** User movement **************
        var forward = false;
        var backward = false;
        var left = false;
        var right = false;

        function keyDown(e) {
            if (e.keyCode == 38 || e.keyCode == 40) {
                e.preventDefault();
            }
            if (e.keyCode == 87 || e.keyCode == 38) {
                forward = true;
            }
            if (e.keyCode == 83 || e.keyCode == 40) {
                backward = true;
            }
            if (e.keyCode == 65 || e.keyCode == 37) {
                left = true;
            }
            if (e.keyCode == 68 || e.keyCode == 39) {
                right = true;
            }
        };

        function keyUp(e) {
            if (e.keyCode == 87 || e.keyCode == 38) {
                forward = false;
            }
            if (e.keyCode == 83 || e.keyCode == 40) {
                backward = false;
            }
            if (e.keyCode == 65 || e.keyCode == 37) {
                left = false;
            }
            if (e.keyCode == 68 || e.keyCode == 39) {
                right = false;
            }
        };

        document.addEventListener('keydown', keyDown);
        document.addEventListener('keyup', keyUp);

        function cross(a, b) {
            return {
                x: a.y * b.z - a.z * b.y,
                y: a.z * b.x - a.x * b.z,
                z: a.x * b.y - a.y * b.x
            };
        }

        var viewDirection = new THREE.Vector3();
        var upVector = new THREE.Vector3(0, 1, 0);

//Find the height of the spherical world at given x,z position
        function placeOnSphere(v) {
            let theta = Math.acos(v.z / radius);
            let phi = Math.acos(v.x / (radius * Math.sin(theta)));
            let sV = radius * Math.sin(theta) * Math.sin(phi);
            //If undefined, set to default value
            if (sV != sV) {
                sV = v.y;
            }
            return sV;
        }

        function move(dT) {

            self.app.camera.getWorldDirection(viewDirection);
            length = Math.sqrt(viewDirection.x * viewDirection.x + viewDirection.z * viewDirection.z);
            viewDirection.x /= length;
            viewDirection.z /= length;
            if (forward) {
                pos.x += dT * speed * viewDirection.x;
                pos.y += dT * speed * viewDirection.z;
            }
            if (backward) {
                pos.x -= dT * speed * viewDirection.x;
                pos.y -= dT * speed * viewDirection.z;
            }
            if (left) {
                var rightVector = cross(upVector, viewDirection);
                pos.x += dT * speed * rightVector.x;
                pos.y += dT * speed * rightVector.z;
            }
            if (right) {
                var rightVector = cross(upVector, viewDirection);
                pos.x -= dT * speed * rightVector.x;
                pos.y -= dT * speed * rightVector.z;
            }

            if (groundShader) {
                groundShader.uniforms.posX.value = pos.x;
                groundShader.uniforms.posZ.value = pos.y;
                groundShader.uniforms.radius.value = radius;
            }
            grassMaterial.uniforms.posX.value = pos.x;
            grassMaterial.uniforms.posZ.value = pos.y;
            grassMaterial.uniforms.radius.value = radius;
        }


        var time = 0;
        var lastFrame = Date.now();
        var thisFrame;
        var dT = 0;

        function draw() {

            //Update time
            thisFrame = Date.now();
            dT = (thisFrame - lastFrame) / 200.0;
            time += dT;
            move(dT);
            lastFrame = thisFrame;

            grassMaterial.uniforms.time.value = time;

            self.app.renderer.clear();
            self.app.renderer.render(self.app.scene, self.app.camera);

            requestAnimationFrame(draw);
        }

        draw();
    }
}
