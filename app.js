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

scene.background = new THREE.Color(0xffa500);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; //enable shadow
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const hero = Hero();
scene.add(hero);
const world = World();
scene.add(world);

function Hero() {
   const heroGeometry = new THREE.SphereBufferGeometry(15, 32, 16);
   const heroMaterial = new THREE.MeshBasicMaterial({
      color: 0xe5f2f2,
      flatShading: true,
   });
   const hero = new THREE.Mesh(heroGeometry, heroMaterial);
   hero.castShadow = true;
   return hero;
}

function World() {
   const worldGeometry = new THREE.SphereBufferGeometry(26, 40, 40);
   const worldMaterial = new THREE.MeshStandardMaterial({
      color: 0x17d7a0,
      flatShading: true,
   });
   const world = new THREE.Mesh(worldGeometry, worldMaterial);
   world.receiveShadow = true;
   world.position.y = -24;
   world.position.z = 2;
   return world;
}

function animate() {
   requestAnimationFrame(animate);
   renderer.render(scene, camera);
}
animate();
