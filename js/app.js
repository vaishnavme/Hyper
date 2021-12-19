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
camera.position.z = 6.5;

const sphericalHelper = new THREE.Spherical();
const clock = new THREE.Clock();
clock.start();

let world;
let hero;
let currentLane;
let heroJump = false;
let bounceValue = 0.1;
let colliableObjects = [];

const middleLane = 0;
const worldRadius = 26;
const heroBaseYPos = 1.9;
const obstacleCollection = [];
const obstaclesInPath = [];
const coinsCollection = [];
const coinsInPath = [];

const healthCounter = document.getElementById("health-counter");
const coinCounter = document.getElementById("coin-counter");

function init() {
   //set world
   world = World();
   world.rotation.z = -Math.PI / 2;
   world.position.y = -24;
   world.position.z = 2;

   //set hero
   hero = Hero();
   hero.health = 100;
   hero.coins = 0;
   currentLane = middleLane;

   hero.position.x = currentLane;
   hero.position.y = heroBaseYPos;
   hero.position.z = 5;

   scene.add(world);
   scene.add(hero);

   addLightToScene();
   createObstaclesPool();
   createCoinsPool();

   colliableObjects = [...obstacleCollection];
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
   //remove recent lane used
   options.slice(lane, 1);
   if (Math.random() > 0.5) {
      lane = Math.floor(Math.random() * 2);
      generateObstacles(true, lane);
   }
}

function obstacleLogic() {
   let obstacleMark;
   let obstaclePos = new THREE.Vector3();
   const obstaclesToRemove = [];
   obstaclesInPath.forEach(function (element, index) {
      obstacleMark = obstaclesInPath[index];
      obstaclePos.setFromMatrixPosition(obstacleMark.matrixWorld); //set obstacle pos acc to obstaclemark

      if (obstaclePos.z > 6 && obstacleMark.visible) {
         obstaclesToRemove.push(obstacleMark);
      }
   });
   let fromWhere;
   obstaclesToRemove.forEach(function (element, index) {
      obstacleMark = obstaclesToRemove[index];
      fromWhere = obstaclesInPath.indexOf(obstacleMark);
      obstaclesInPath.splice(fromWhere, 1);
      obstacleCollection.push(obstacleMark);
      obstacleMark.visible = false;
      console.log("REMOVE OBSTACLE");
   });
}

function generateCoins(row) {
   const pathAngleValues = [1.52, 1.57, 1.62];
   let newCoin;

   if (coinsCollection.length === 0) return;
   newCoin = coinsCollection.pop();
   newCoin.visible = true;
   coinsInPath.push(newCoin);

   sphericalHelper.set(
      worldRadius - 0.3,
      pathAngleValues[row],
      -world.rotation.x + 4
   );

   newCoin.position.setFromSpherical(sphericalHelper);
   const worldVectors = world.position.clone().normalize();
   const coinVector = newCoin.position.clone().normalize();
   // set rotation of (arg1) in same direction to arg2
   newCoin.quaternion.setFromUnitVectors(coinVector, worldVectors);
   newCoin.rotation.x += Math.random() * ((2 * Math.PI) / 10) + -Math.PI / 10;
   world.add(newCoin);
}

function createCoinsPool() {
   for (let i = 0; i < 15; i++) {
      const newCoin = createCoin();
      coinsCollection.push(newCoin);
   }
}

function addCoinsInPath() {
   const options = [0, 1, 2];
   let lane = Math.floor(Math.random() * 3);
   generateCoins(lane);
   options.slice(lane, 1);
}

function coinLogic() {
   let coinMark;
   let coinPos = new THREE.Vector3();
   const coinsToRemove = [];
   coinsInPath.forEach(function (element, index) {
      coinMark = coinsInPath[index];
      coinPos.setFromMatrixPosition(coinMark.matrixWorld);

      if (coinPos.z > 6 && coinMark.visible) {
         coinsToRemove.push(coinMark);
         //check collision
      } else {
         //check collision
         if (coinPos.distanceTo(hero.position) <= 0.7) {
            hero.coins += 0.25;
            //console.log("COIN HIT");
            coinCounter.innerText = `Coins: ${Math.floor(hero.coins)}`;
         }
      }
   });
   let fromWhere;
   coinsToRemove.forEach(function (element, index) {
      coinMark = coinsToRemove[index];
      fromWhere = coinsInPath.indexOf(coinMark);
      console.log(fromWhere);
      coinsInPath.splice(fromWhere, 1);
      coinsCollection.push(coinMark);
      coinMark.visible = false;
      console.log("COIN REMOVED");
   });
}

function collisionDetection() {
   //get current hero pos
   const originPoint = hero.position.clone();

   for (
      let vertexIndex = 0;
      vertexIndex < hero.geometry.vertices.length;
      vertexIndex += 5
   ) {
      // get current vertex
      const localVertex = hero.geometry.vertices[vertexIndex].clone();
      // global vertex matrix
      const globalVertex = localVertex.applyMatrix4(hero.matrix);
      // direction ray going from that vertex -> create raycast
      const directionVertex = globalVertex.sub(hero.position);
      //send beam from
      //origin point -> character vertex -> to direction of vertex
      const raycast = new THREE.Raycaster(
         originPoint,
         directionVertex.clone().normalize()
      );

      const collisions = raycast.intersectObjects(colliableObjects);

      if (
         collisions.length > 0 &&
         collisions[0].distance < directionVertex.length()
      ) {
         hero.health -= 0.25;
         healthCounter.innerText = `Health: ${Math.floor(hero.health)}`;
         splashScreen.classList.add("active");

         let timer;
         timer = setTimeout(() => {
            clearTimeout(timer);
            splashScreen.classList.remove("active");
         }, 400);

         if (hero.health <= 1) {
            restartModal.classList.add("visible");
            coinCounter.innerText = "Coins: 0";
            healthCounter.innerText = "Health: 0";
            break;
         }
      }
   }
}

function update() {
   const gravityValue = 0.005;
   const rollingSpeed = 0.008;
   const obstacleReleaseTime = 0.5;
   const heroRollingSpeed = (rollingSpeed * worldRadius) / 0.2 / 5;

   world.rotation.x += 0.01;
   hero.rotation.x -= heroRollingSpeed;

   if (hero.position.y <= heroBaseYPos) {
      heroJump = false;
      bounceValue = Math.random() * 0.03 + 0.005; //reset bounce value
   }
   hero.position.y += bounceValue;
   bounceValue -= gravityValue;

   hero.position.x = THREE.Math.lerp(
      hero.position.x, //current pos
      currentLane, //pos2
      2 * clock.getDelta() //time to change pos
   );

   // release next obstacle after 0.5s
   if (clock.getElapsedTime() > obstacleReleaseTime) {
      clock.start(); //restart clock
      addObstaclesToPath();
      addCoinsInPath();
   }
   obstacleLogic();
   coinLogic();
   collisionDetection();
}

const handleUserInputs = function (action) {
   const leftLane = -1;
   const rightLane = 1;

   let validAction = true;

   switch (action) {
      case "UP":
         bounceValue = 0.1;
         heroJump = true;
         break;

      case "LEFT":
         if (currentLane === middleLane) {
            currentLane = leftLane;
         } else if (currentLane === rightLane) {
            currentLane = middleLane;
         } else {
            validAction = false;
         }
         break;

      case "RIGHT":
         if (currentLane === middleLane) {
            currentLane = rightLane;
         } else if (currentLane === leftLane) {
            currentLane = middleLane;
         } else {
            validAction = false;
         }
         break;

      default:
         validAction = false;
   }
   if (validAction) {
      heroJump = true;
      bounceValue = 0.06;
   }
};

const handleKeys = function (event) {
   const { keyCode } = event;
   const keyPress = {
      LEFT: 37,
      RIGHT: 39,
      UP: 38,
   };
   if (keyCode === keyPress.UP) {
      handleUserInputs("UP");
   } else if (keyCode === keyPress.LEFT) {
      handleUserInputs("LEFT");
   } else if (keyCode === keyPress.RIGHT) {
      handleUserInputs("RIGHT");
   }
};

//helpers
// const cameraHelper = new THREE.CameraHelper(camera);
// scene.add(cameraHelper);

const leftButton = document.getElementById("left-btn");
const rightButton = document.getElementById("right-btn");
const upButton = document.getElementById("up-btn");

const startGameBtn = document.getElementById("start-game");
const restartGameBtn = document.getElementById("restart-game");

const splashScreen = document.getElementById("splash-screen");
const startModal = document.getElementById("start-modal");
const restartModal = document.getElementById("restart-modal");

function animate() {
   requestAnimationFrame(animate);
   renderer.render(scene, camera);
   update();
}

function restartGame() {
   restartModal.classList.remove("visible");
   restartModal.classList.add("hide");
   window.location.reload();
}

function startGame() {
   startModal.classList.remove("visible");
   startModal.classList.add("hide");
   init();
   animate();
}
function onWindowResize() {
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix(); // update camera aspects and projectons
   renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);
document.addEventListener("keydown", handleKeys);

leftButton.addEventListener("click", () => handleUserInputs("LEFT"));
rightButton.addEventListener("click", () => handleUserInputs("RIGHT"));
upButton.addEventListener("click", () => handleUserInputs("UP"));

startGameBtn.addEventListener("click", startGame);
restartGameBtn.addEventListener("click", restartGame);
