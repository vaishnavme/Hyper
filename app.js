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

function animate() {
   requestAnimationFrame(animate);
   renderer.render(scene, camera);
}
animate();
