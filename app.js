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

const clock = new THREE.Clock();
clock.start();

//global variables
const sphericalHelper = new THREE.Spherical();
//obstacles
const obstacleCollection = [];
const obstacleInPath = [];
// coins
const coinsCollections = [];
const coinsInPath = [];

const heroRadius = 0.2;
const worldRadius = 26;
const rollingSpeed = 0.008;
const middleLane = 0;
const heroBaseYPos = 1.9;

let scene;
let animationFramId;
let hero;
let currentLane;
let rotatingWorld;
let bounceValue = 0.1;
let heroJump = false;
let isHeroCollided = false;
let heroHealth = 100;
let coins = 0;
let collidableObjects;

const healthCounter = document.getElementById("health-counter");
const coinCounter = document.getElementById("coin-counter");

function initialize() {
   createScene();
   update();
}

function createScene() {
   scene = new THREE.Scene();
   scene.fog = new THREE.FogExp2(0xf0fff0, 0.14);

   hero = Hero();
   scene.add(hero);

   World();
   createObstaclessPool();
   AddLightToScene();
   collidableObjects = [...obstacleCollection];
}

// main character
function Hero() {
   const heroGeometry = new THREE.DodecahedronGeometry(heroRadius, 1);
   const heroMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5f2f2,
      flatShading: true,
   });
   const hero = new THREE.Mesh(heroGeometry, heroMaterial);
   hero.castShadow = true;
   currentLane = middleLane;
   hero.position.x = currentLane;
   hero.position.y = heroBaseYPos;
   hero.position.z = 4.8;
   hero.health = 100;
   return hero;
}

//create obstacle
function createObstacles() {
   const obstacleGeometry = new THREE.BoxBufferGeometry(1, 4, 0.6);
   const obstacleMaterial = new THREE.MeshBasicMaterial({
      color: 0x142f43,
      flatShading: true,
   });
   const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
   return obstacle;
}

// generates obstacles in hero path or outside hero path
// path value taken from obstacleCollection
// else create new tree
function generateObstacles(inPath, row, isLeft) {
   let newObstacle;
   const pathAngleValues = [1.52, 1.57, 1.62];
   if (inPath) {
      if (obstacleCollection.length == 0) return;
      newObstacle = obstacleCollection.pop();
      newObstacle.visible = true;
      //console.log("add tree");
      obstacleInPath.push(newObstacle);
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

// // add obstacles to world
function addObstaclesToWorld() {
   const numberOfObstacles = 36;
   const gap = 6.28 / 36;
   for (let i = 0; i < numberOfObstacles; i++) {
      generateObstacles(false, i * gap, true);
      generateObstacles(false, i * gap, false);
   }
}

// // add to obstacle collection
function createObstaclessPool() {
   const maxObstacleInCollection = 12;
   let newObstacle;
   for (let i = 0; i < maxObstacleInCollection; i++) {
      newObstacle = createObstacles();
      obstacleCollection.push(newObstacle);
   }
}

//  add obstacle to hero path
function addObstaclesInPath() {
   const options = [0, 1, 2];
   let lane = Math.floor(Math.random() * 3);
   generateObstacles(true, lane);
   options.slice(lane, 1);
   if (Math.random() > 0.5) {
      lane = Math.floor(Math.random() * 2);
      generateObstacles(true, options[lane]);
   }
}

// coins
function createCoins() {
   const coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 5, 1);
   const coinMaterial = new THREE.MeshBasicMaterial({
      color: 0xfbf46d,
      flatShading: true,
   });
   const coin = new THREE.Mesh(coinGeometry, coinMaterial);
   return coin;
}

function generateCoins(inPath, row) {
   let newCoin;
   const pathAngleValues = [1.52, 1.57, 1.62];
   if (inPath) {
      if (coinsCollections.length == 0) return;
      newCoin = coinsCollections.pop();
      newCoin.visible = true;
      coinsInPath.push(newCoin);
      sphericalHelper.set(
         worldRadius - 0.3,
         pathAngleValues[row],
         -rotatingWorld.rotation.x + 4
      );
   } else {
      newCoin = createCoins();
      sphericalHelper.set(worldRadius - 0.3, forestAreaAngle, row);
   }
   newCoin.position.setFromSpherical(sphericalHelper);
   let rollingGroundVector = rotatingWorld.position.clone().normalize();
   let treeVector = newCoin.position.clone().normalize();
   newCoin.quaternion.setFromUnitVectors(treeVector, rollingGroundVector);
   newCoin.rotation.x += Math.random() * ((2 * Math.PI) / 10) + -Math.PI / 10;
   rotatingWorld.add(newCoin);
}

// add obstacles to world
function addCoinsToWorld() {
   const gap = 10 / 36;
   const maxCoinInCollection = 12;
   let newCoin;
   for (let i = 0; i < maxCoinInCollection; i++) {
      generateCoins(true, i * gap);
      newCoin = createCoins();
      coinsCollections.push(newCoin);
   }
}

// add coins to hero path
function addCoinInPath() {
   const options = [0, 1, 2];
   let lane = Math.floor(Math.random() * 3);
   generateCoins(true, lane);
   options.slice(lane, 1);
   if (Math.random() > 0.5) {
      lane = Math.floor(Math.random() * 2);
      generateCoins(true, options[lane]);
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
   addCoinsToWorld();
}

// add sun light to view
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

// handle user action keyboar or click
function handleUserInputs(action) {
   const leftLane = -1;
   const rightLane = 1;
   if (heroJump) return;
   let validAction = true;
   switch (action) {
      case "LEFT":
         //left;
         if (currentLane === middleLane) {
            currentLane = leftLane;
         } else if (currentLane === rightLane) {
            currentLane = middleLane;
         } else {
            validAction = false;
         }
         break;
      case "RIGHT":
         //right;
         if (currentLane === middleLane) {
            currentLane = rightLane;
         } else if (currentLane === leftLane) {
            currentLane = middleLane;
         } else {
            validAction = false;
         }
         break;
      case "UP":
         bounceValue = 0.1;
         heroJump = true;
         break;
      default:
         validAction = false;
   }
   if (validAction) {
      heroJump = true;
      bounceValue = 0.06;
   }
}

function obstacleLogic() {
   let obstacleMark;
   let obstaclePos = new THREE.Vector3();
   let obstacleToRemove = [];
   obstacleInPath.forEach(function (element, index) {
      obstacleMark = obstacleInPath[index];
      obstaclePos.setFromMatrixPosition(obstacleMark.matrixWorld);
      if (obstaclePos.z > 6 && obstacleMark.visible) {
         //gone out of our view zone
         obstacleToRemove.push(obstacleMark);
      }
   });
   // remove from scene after it pass away.
   let fromWhere;
   obstacleToRemove.forEach(function (element, index) {
      obstacleMark = obstacleToRemove[index];
      fromWhere = obstacleInPath.indexOf(obstacleMark);
      obstacleInPath.splice(fromWhere, 1);
      obstacleCollection.push(obstacleMark);
      obstacleMark.visible = false;
      //console.log("REMOVE OBSTACLE");
   });
}

function coinLogic() {
   let coinMark;
   let coinPos = new THREE.Vector3();
   let coinToRemove = [];
   coinsInPath.forEach(function (element, index) {
      coinMark = coinsInPath[index];
      coinPos.setFromMatrixPosition(coinMark.matrixWorld);
      if (coinPos.z > 6 && coinMark.visible) {
         //gone out of our view zone
         coinToRemove.push(coinMark);
      } else {
         //check collision
         if (coinPos.distanceTo(hero.position) <= 0.7) {
            coins += 0.25;
            //console.log("COIN HIT");
            coinCounter.innerText = `Coins: ${Math.floor(coins)}`;
         }
      }
   });
   // remove from scene after it pass away.
   let fromWhere;
   coinToRemove.forEach(function (element, index) {
      coinMark = coinToRemove[index];
      fromWhere = coinsInPath.indexOf(coinMark);
      coinsInPath.splice(fromWhere, 1);
      coinsCollections.push(coinMark);
      coinMark.visible = false;
      //console.log("REMOVE COIN");
   });
}

function update() {
   const gravity = 0.005;
   const obstacleReleaseInterval = 0.5;
   const heroRollingSpeed = (rollingSpeed * worldRadius) / heroRadius / 5;

   // rotate x-axis
   rotatingWorld.rotation.x += rollingSpeed;
   hero.rotation.x -= heroRollingSpeed;
   if (hero.position.y <= heroBaseYPos) {
      heroJump = false;
      bounceValue = Math.random() * 0.04 + 0.005;
   }
   hero.position.y += bounceValue; // jump effect change ypos per frame
   hero.position.x = THREE.Math.lerp(
      hero.position.x,
      currentLane,
      2 * clock.getDelta()
   );
   bounceValue -= gravity; // gravity remove from val from bounce
   // add new obstacle if time is passed
   if (clock.getElapsedTime() > obstacleReleaseInterval) {
      clock.start();
      addObstaclesInPath();
      addCoinInPath();
   }
   obstacleLogic();
   coinLogic();

   let originPoint = hero.position.clone();

   for (
      let vertexIndex = 0;
      vertexIndex < hero.geometry.vertices.length;
      vertexIndex++
   ) {
      //get current vertex
      let localVertex = hero.geometry.vertices[vertexIndex].clone();
      //global vertex matrix
      let globalVertex = localVertex.applyMatrix4(hero.matrix);
      //direction going from that vertex -> create raycast
      let directionVector = globalVertex.sub(hero.position);

      //send beam from
      //origin point -> character vertex -> to direction of vertex
      let raycast = new THREE.Raycaster(
         originPoint,
         directionVector.clone().normalize()
      );

      let collisions = raycast.intersectObjects(collidableObjects);
      if (
         collisions.length > 0 &&
         collisions[0].distance < directionVector.length()
      ) {
         hero.health -= 0.5;
         healthCounter.innerText = "Health : " + Math.floor(hero.health);
         splashScreen.classList.add("active");
         setTimeout(() => {
            splashScreen.classList.remove("active");
         }, 500);
         if (hero.health <= 1) {
            restartModal.classList.add("visible");
            coinCounter.innerText = `Coins: 0`;
            healthCounter.innerText = "Health : 0";
         }
         break;
      }
   }
   render();
   requestAnimationFrame(update); //request next update
}

function onWindowResize() {
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix(); // update camera aspects and projectons
   renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

// dom elements
function handleKeys(event) {
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
}

function restartGame() {
   restartModal.classList.remove("visible");
   restartModal.classList.add("hide");
   window.location.reload();
}

document.addEventListener("keydown", handleKeys);

const upButton = document.getElementById("up-btn");
const leftButton = document.getElementById("left-btn");
const rightButton = document.getElementById("right-btn");

const splashScreen = document.getElementById("splash-screen");
const startModal = document.getElementById("start-modal");
const restartModal = document.getElementById("restart-modal");

const startGameBtn = document.getElementById("start-game");
const restartGameBtn = document.getElementById("restart-game");

const finalScoreEle = document.getElementById("final-score");

upButton.addEventListener("click", () => handleUserInputs("UP"));
leftButton.addEventListener("click", () => handleUserInputs("LEFT"));
rightButton.addEventListener("click", () => handleUserInputs("RIGHT"));

startGameBtn.addEventListener("click", startGame);
restartGameBtn.addEventListener("click", restartGame);

function render() {
   renderer.render(scene, camera);
}

function startGame() {
   startModal.classList.remove("visible");
   startModal.classList.add("hide");
   initialize();
}
