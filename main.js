import './style.css'

import * as THREE from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { Vector3 } from "three";

const raycaster = new THREE.Raycaster();


// Set up the scene, camera, and renderer
const clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xbfe3dd );

// Create an ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Create a point light
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = -5;

console.log("ss")

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);

// Set up the snow particles
const geometry = new THREE.BufferGeometry();
var vertices = new Float32Array(10000 * 3);
// Create the individual snowflakes and add them to the geometry
for (let i = 0; i < 10000; i++) {
  const snowflake = new THREE.Vector3();
  vertices[i * 3] = Math.random() * 800 - 400;
  vertices[i * 3 + 1] = Math.random() * 800 - 400;
  vertices[i * 3 + 2] = Math.random() * 800 - 400;
}
geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

// Create a custom shader material
var material = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Color(0xffffff) }
  },
  vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = (1.f - (gl_Position.z * 0.001)) * 5.f;
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    void main() {
      float r = 0.5;  // radius of the circle
      vec2 c = vec2(0.5, 0.5);  // center of the circle
      vec2 p = gl_PointCoord - c;
      if (dot(p, p) > r*r) discard;  // discard fragments outside the circle
      gl_FragColor = vec4(0.7);
    }
  `
});

// Create the snow particle system and add it to the scene
const snowflakes = new THREE.Points(geometry, material);

scene.add(snowflakes);

// Load the GLTFLoader
const loader = new GLTFLoader();

var mixer = null;
// Load the GLB file
loader.load('https://ilyashurupov.github.io/funny_neurons/tmp/cube.glb', function ( gltf ) {

  // Extract the animation clips from the model
  const animations = gltf.animations;

  // Create an AnimationMixer
  mixer = new THREE.AnimationMixer(gltf.scene);

  // Add the animation clips to the mixer
  for (const clip of animations) {
    mixer.clipAction(clip).play();
    console.log("psd");
  }

  // Add the loaded object to the scene
  scene.add( gltf.scene );

});


// Animate the snowflakes
function animate() {
  requestAnimationFrame(animate);
  
  snowflakes.rotation.x += 0.0002;
  snowflakes.rotation.y += 0.0002;

  if (mixer) {
    mixer.update(clock.getDelta());
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

function goToPage(url) {
  location.replace(url);
}

window.addEventListener('mouseup', (event) => {

  const pointer = new THREE.Vector2();
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	// update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children, true );

	if (intersects.length) {
    console.log("redirect");
    goToPage("./tmp/portfolio.html");
  }
  
});

animate();