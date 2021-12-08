import { World, Hero, createObstacle, createCoin } from "./scene.js";

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ alpha: true }); //transparency

//scene.fog = new THREE.FogExp2(0xf0fff0, 0.14);
renderer.shadowMap.enabled = true; //enable shadow
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
   60, //degree to show
   window.innerWidth / window.innerHeight,
   0.1, // near fov
   1000 // far fov
);

//camera position
camera.position.y = 2.4;
camera.position.z = 60.5;

let world;

init();

function init() {
   //set world
   world = World();
   world.rotation.z = -Math.PI / 2;
   world.position.y = -24;
   world.position.z = 2;

   scene.add(world);

   addLightToScene();
}

function addLightToScene() {
   const light = new THREE.HemisphereLight(0xfffafa, 0x000000, 0.9);
   const sun = new THREE.DirectionalLight(0xcdc1c5, 0.9);
   //Set up shadow properties for the light
   sun.position.set(12, 6, -7); //x,x,z
   sun.castShadow = true;
   sun.shadow.mapSize.width = 256;
   sun.shadow.mapSize.height = 256;
   sun.shadow.camera.near = 0.5;
   sun.shadow.camera.far = 50;

   scene.add(light);
   scene.add(sun);
}

//helpers
console.log("Camera: ", camera.position);
console.log("World: ", world.position);

const cameraHelper = new THREE.CameraHelper(camera);
scene.add(cameraHelper);

function generateObstacles()

function update() {
   world.rotation.x += 0.01;
}

function animate() {
   requestAnimationFrame(animate);
   renderer.render(scene, camera);
   update();
}

animate();
