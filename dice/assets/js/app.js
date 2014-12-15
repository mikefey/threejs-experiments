var canvas;
var context;
var container, stats;
var camera, scene, renderer;
var rotSpeed = .005;
var dieOne;
var dieTwo;
var rollCompleteTimeout = 0;
var rolling = false;
var raycaster;
var dieOneRoll;
var dieTwoRoll;

Physijs.scripts.worker = 'assets/js/lib/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

document.addEventListener('DOMContentLoaded', function(event) { 
  init();
  animate();
});

function init() {
  var numPoints = 50;
  container = document.getElementById('app');
 
  scene = new Physijs.Scene;
  scene.setGravity(new THREE.Vector3( 0, -50, 0 ));
  scene.addEventListener('update', function() {
    scene.simulate( undefined, 1 );
    physicsStats.update();
  });

  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set( 0, 40, 60 );
  camera.lookAt( scene.position );
  scene.add( camera );

  renderer = new THREE.WebGLRenderer();
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.setClearColor(0x444444);
  container.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  physicsStats = new Stats();
  physicsStats.domElement.style.position = 'absolute';
  physicsStats.domElement.style.top = '50px';
  physicsStats.domElement.style.zIndex = 100;
  container.appendChild(physicsStats.domElement);

  addLight();

  createGround();

  onResize();
  window.addEventListener( 'resize', onResize, false );

  scene.simulate();

  dieOne = createBox(1);
  dieOne.name = 'dieOne';
  scene.add(dieOne);

  dieTwo = createBox(2);
  dieTwo.name = 'dieTwo';
  scene.add(dieTwo);

  dieOne.visible = false;
  dieTwo.visible = false;

  document.getElementById('roll-button').addEventListener('click', setupAndRoll);
}

function addLight() {
  // Light
  light = new THREE.DirectionalLight( 0xFFFFFF );
  light.position.set( 20, 40, -15 );
  light.target.position.copy( scene.position );
  light.castShadow = true;
  light.shadowCameraLeft = -60;
  light.shadowCameraTop = -60;
  light.shadowCameraRight = 60;
  light.shadowCameraBottom = 60;
  light.shadowCameraNear = 20;
  light.shadowCameraFar = 200;
  light.shadowBias = -.0001
  light.shadowMapWidth = light.shadowMapHeight = 2048;
  light.shadowDarkness = .7;
  scene.add( light );
}

function createGround() {
  // Ground
  var groundMaterial = Physijs.createMaterial(
    new THREE.MeshBasicMaterial({ color:0x444444 }),
    .8,
    .3
  );
  
  ground = new Physijs.BoxMesh(
    new THREE.BoxGeometry(100, 1, 100),
    groundMaterial,
    0
  );
  ground.receiveShadow = true;
  scene.add( ground );
}

function createBox(num) {
  var boxGeometry = new THREE.BoxGeometry(4, 4, 4);
  var box;
  var material;
  var xPos = -5;

  var materialArray = [];
  materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'assets/images/one.jpg' ) }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'assets/images/six.jpg' ) }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'assets/images/two.jpg' ) }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'assets/images/five.jpg' ) }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'assets/images/three.jpg' ) }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'assets/images/four.jpg' ) }))
  var diceMaterial = new THREE.MeshFaceMaterial(materialArray);

  material = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color:0x00ff00 }), .6, .3);
  material = Physijs.createMaterial(
    diceMaterial,
    .6,
    .6
  );

  box = new Physijs.BoxMesh(boxGeometry, material);
  box.collisions = 0;

  if (num == 2) {
    xPos = 5;
  }
        
  box.position.set(xPos, 15, 0);
        
  box.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
        
  box.castShadow = true;
  box.addEventListener( 'collision', handleCollision );
  box.addEventListener( 'ready', boxReady );
  
  return box;
}

function boxReady() {
  dieOne.visible = true;
  dieTwo.visible = true;
  document.getElementById('button-wrapper').style.display = 'block';
}

function setupAndRoll() {
  document.getElementById('roll-results').innerHTML = '';
  clearTimeout(rollCompleteTimeout);
  rolling = true;
  rollCompleteTimeout = setTimeout(onRollComplete, 3000);

  dieOne.position.set(-5, 15, 20);
  dieOne.__dirtyPosition = true;
  dieOne.setLinearVelocity({z: -20, y: 0, x: 0 });
  dieOne.setAngularVelocity({z: -3, y: -5, x: -3 });
  
  dieTwo.position.set(5, 15, 20);
  dieTwo.__dirtyPosition = true;
  dieTwo.setLinearVelocity({z: -20, y: 0, x: 0 });
  dieTwo.setAngularVelocity({z: -5, y: -4, x: -4 });
}

function onRollComplete() {
  rolling = false;

  var origin = new THREE.Vector3(0, 30, 0);
  
  var dieOneDirection = new THREE.Vector3().subVectors(dieOne.position, origin).normalize();
  raycaster = new THREE.Raycaster(origin, dieOneDirection);
  var dieOneIntersects = raycaster.intersectObject(dieOne, true);
  dieOneRoll = dieOneIntersects[0].face.materialIndex;

  var dieTwoDirection = new THREE.Vector3().subVectors(dieTwo.position, origin).normalize();
  raycaster = new THREE.Raycaster(origin, dieTwoDirection);
  var dieTwoIntersects = raycaster.intersectObject(dieTwo, true);
  dieTwoRoll = dieTwoIntersects[0].face.materialIndex;
  
  getTotalRoll();
}

function getTotalRoll() {
  var amount1 = getRollAmount(dieOneRoll);
  var amount2 = getRollAmount(dieTwoRoll);

  document.getElementById('roll-results').innerHTML = 'You rolled: ' + (amount1 + amount2);
}

function getRollAmount(index) {
  var rollAmount;
  
  switch(index) {
    case 0:
      rollAmount = 1;
      break;
    case 1:
      rollAmount = 6;
      break;
    case 2:
      rollAmount = 2;
      break;
    case 3:
      rollAmount = 5;
      break;
    case 4:
      rollAmount = 3;
      break;
    case 5:
      rollAmount = 4;
      break;
  }

  return rollAmount;
}

function handleCollision( collided_with, linearVelocity, angularVelocity ) {
  
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame( animate );
  render();
  stats.update();
}

function render() {
  var time = performance.now();

  //checkRotation();

  renderer.render( scene, camera );

}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function checkRotation(){
  var x = camera.position.x,
    y = camera.position.y,
    z = camera.position.z;

  camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
  camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
  camera.position.y = y * Math.cos(rotSpeed / 2) - z * Math.sin(rotSpeed / 2);

  camera.lookAt(scene.position);  
}