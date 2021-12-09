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

const sphericalHelper = new THREE.Spherical();
const clock = new THREE.Clock();
clock.start();

let world;

const worldRadius = 26;
const obstacleCollection = [];
const obstaclesInPath = [];
const coinsCollection = [];
const coinsInPath = [];

init();

function init() {
   //set world
   world = World();
   world.rotation.z = -Math.PI / 2;
   world.position.y = -24;
   world.position.z = 2;

   scene.add(world);

   addLightToScene();
   createObstaclesPool();
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

function generateObstacles(inPath, row, isLeft) {
   const pathAngleValues = [1.52, 1.57, 1.62];
   let newObstacle;

   if (inPath) {
      if (obstacleCollection.length === 0) return;
      newObstacle = obstacleCollection.pop();
      newObstacle.visible = true;
      obstaclesInPath.push(newObstacle);

      sphericalHelper.set(
         worldRadius - 0.3,
         pathAngleValues[row],
         -world.rotation.x + 4
      );
   } else {
      newObstacle = createObstacle();
      let obstacleAngle = 0;
      if (isLeft) {
         obstacleAngle = 1.68 + Math.random() * 0.1;
      } else {
         obstacleAngle = 1.46 - Math.random() * 0.1;
      }
      sphericalHelper.set(worldRadius - 0.3, obstacleAngle, row); //x, y, z
   }
   newObstacle.position.setFromSpherical(sphericalHelper);
   const worldVector = world.position.clone().normalize();
   const obstacleVector = newObstacle.position.clone().normalize();
   //set rotation of (arg1) in same from direction to arg2
   newObstacle.quaternion.setFromUnitVectors(obstacleVector, worldVector);
   newObstacle.rotation.x +=
      Math.random() * ((2 * Math.PI) / 10 + -Math.PI / 10);

   world.add(newObstacle);
}

function createObstaclesPool() {
   const gap = 6.28 / 36;
   for (let i = 0; i < 36; i++) {
      const newObstacle = createObstacle();
      obstacleCollection.push(newObstacle);
      generateObstacles(false, i * gap, true);
      generateObstacles(false, i * gap, false);
   }
}

function addObstaclesToPath() {
   const options = [0, 1, 2];
   let lane = Math.floor(Math.random() * 3);
   generateObstacles(true, lane);
   options.slice(lane, 1);
   if (Math.random() > 0.5) {
      lane = Math.floor(Math.random() * 2);
      generateObstacles(true, lane);
   }
}

function createCoinsPool() {
   for (let i = 0; i < 15; i++) {
      const newCoin = createCoin();
   }
}

//helpers
console.log("Camera: ", camera.position);
console.log("World: ", world.position);

const cameraHelper = new THREE.CameraHelper(camera);
scene.add(cameraHelper);

function update() {
   const obstacleReleaseTime = 0.5;

   world.rotation.x += 0.01;

   // release next obstacle after 0.5s
   if (clock.getElapsedTime() > obstacleReleaseTime) {
      clock.start(); //restart clock
      addObstaclesToPath();
   }
}

function animate() {
   requestAnimationFrame(animate);
   renderer.render(scene, camera);
   update();
}

animate();
