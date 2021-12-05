const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ alpha: true });
const camera = new THREE.PerspectiveCamera(
   60, //verticle field of view
   window.innerWidth / window.innerHeight, //aspect ratio
   0.1, //near point
   1000 // far point
);

//camera position
camera.position.y = 2.5;
camera.position.z = 6.5;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; //enable shadow
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//global variables
const sphericalHelper = new THREE.Spherical();
const obstacleCollection = [];
const worldRadius = 26;
const rollingSpeed = 0.008;
const middleLane = 0;
const heroBaseYPos = 1.8;

let currentLane;
let rotatingWorld;

const hero = Hero();
scene.add(hero);
World();
createObstaclessPool();

function Hero() {
   const heroGeometry = new THREE.SphereBufferGeometry(15, 32, 16);
   const heroMaterial = new THREE.MeshBasicMaterial({
      color: 0xe5f2f2,
      flatShading: true,
   });
   const hero = new THREE.Mesh(heroGeometry, heroMaterial);
   hero.castShadow = true;
   currentLane = middleLane;
   hero.position.x = currentLane;
   hero.position.y = heroBaseYPos;
   hero.position.z = 4.8;
   return hero;
}

function createObstacles() {
   const obstacleGeometry = new THREE.BoxBufferGeometry(1, 5, 0.6);
   const obstacleMaterial = new THREE.MeshBasicMaterial({
      color: 0x142f43,
      flatShading: true,
   });
   const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
   return obstacle;
}

function generateObstacles(inPath, row, isLeft) {
   let newObstacle;
   const pathAngleValues = [1.52, 1.57, 1.62];
   if (inPath) {
      if (obstacleCollection.length == 0) return;
      newObstacle = obstacleCollection.pop();
      newObstacle.visible = true;
      //console.log("add tree");
      treesInPath.push(newObstacle);
      sphericalHelper.set(
         worldRadius - 0.3,
         pathAngleValues[row],
         -rotatingWorld.rotation.x + 4
      );
   } else {
      newObstacle = createObstacles();
      let forestAreaAngle = 0; //[1.52,1.57,1.62];
      if (isLeft) {
         forestAreaAngle = 1.68 + Math.random() * 0.1;
      } else {
         forestAreaAngle = 1.46 - Math.random() * 0.1;
      }
      sphericalHelper.set(worldRadius - 0.3, forestAreaAngle, row);
   }
   newObstacle.position.setFromSpherical(sphericalHelper);
   let rollingGroundVector = rotatingWorld.position.clone().normalize();
   let treeVector = newObstacle.position.clone().normalize();
   newObstacle.quaternion.setFromUnitVectors(treeVector, rollingGroundVector);
   newObstacle.rotation.x +=
      Math.random() * ((2 * Math.PI) / 10) + -Math.PI / 10;

   rotatingWorld.add(newObstacle);
}

function addObstaclesToWorld() {
   const numberOfObstacles = 36;
   const gap = 6.28 / 36;
   for (let i = 0; i < numberOfObstacles; i++) {
      generateObstacles(false, i * gap, true);
      generateObstacles(false, i * gap, false);
   }
}

function createObstaclessPool() {
   let maxTreesInPool = 10;
   let newTree;
   for (let i = 0; i < maxTreesInPool; i++) {
      newTree = createObstacles();
      obstacleCollection.push(newTree);
   }
}

// add obstacle to hero path
function addObstaclesInPath() {
   const options = [0, 1, 2];
   let lane = Math.floor(Math.random() * 3);
   generateObstacles(true, lane);
   options.slice(lane, 1);
   if (Math.random() > 0.5) {
      lane = Math.floor(Math.random() * 2);
      console.log("lane: ", lane);
      generateObstacles(true, options[lane]);
   }
}

function World() {
   const worldGeometry = new THREE.SphereBufferGeometry(worldRadius, 40, 40);
   const worldMaterial = new THREE.MeshStandardMaterial({
      color: 0x17d7a0,
      flatShading: true,
   });
   rotatingWorld = new THREE.Mesh(worldGeometry, worldMaterial);
   rotatingWorld.receiveShadow = true;
   rotatingWorld.rotation.z = -Math.PI / 2;
   rotatingWorld.position.y = -24;
   rotatingWorld.position.z = 2;
   scene.add(rotatingWorld);
   addObstaclesToWorld();
}

function AddLightToScene() {
   const light = new THREE.HemisphereLight(0xfffafa, 0x000000, 0.9);
   scene.add(light);
   const sun = new THREE.DirectionalLight(0xcdc1c5, 0.9);
   sun.position.set(12, 6, -7);
   sun.castShadow = true;
   scene.add(sun);
   //Set up shadow properties for the sun light
   sun.shadow.mapSize.width = 256;
   sun.shadow.mapSize.height = 256;
   sun.shadow.camera.near = 0.5;
   sun.shadow.camera.far = 50;
}
AddLightToScene();

function update() {
   rotatingWorld.rotation.x += rollingSpeed;
}

function animate() {
   requestAnimationFrame(animate);
   renderer.render(scene, camera);
   // 60fps
   update();
}
animate();
