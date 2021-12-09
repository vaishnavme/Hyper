function Hero() {
   const heroGeometry = new THREE.DodecahedronGeometry(0.2, 1);
   const heroMaterial = new THREE.MeshStandardMaterial({
      color: 0xa2d2ff,
      flatShading: true,
   });
   const hero = new THREE.Mesh(heroGeometry, heroMaterial);
   hero.name = "Hero";
   hero.health = 100;
   hero.coins = 0;

   return hero;
}

function World() {
   const worldGeometry = new THREE.SphereGeometry(26, 40, 40);
   const worldMaterial = new THREE.MeshStandardMaterial({
      color: 0x17d710,
      flatShading: true,
   });
   const world = new THREE.Mesh(worldGeometry, worldMaterial);
   world.name = "World";

   return world;
}

function createObstacle() {
   const obstacleGeometry = new THREE.BoxBufferGeometry(1, 4, 0.6);
   const obstacleMaterial = new THREE.MeshBasicMaterial({
      color: 0x142f43,
   });
   const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
   obstacle.name = "Obstacle";

   return obstacle;
}

function createCoin() {
   const coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 5, 1);
   const coinMaterial = new THREE.MeshBasicMaterial({
      color: 0xfbf46d,
   });
   const coin = new THREE.Mesh(coinGeometry, coinMaterial);
   coin.name = "Coin";

   return coin;
}

export { Hero, World, createObstacle, createCoin };
