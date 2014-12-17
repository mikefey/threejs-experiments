var canvas;
var context;
var container, stats;
var camera, scene, renderer;
var rotSpeed = .005;
var frameGeometry;
var objectArray = [];
var mouseSpeed = 0;
var lastMousePosition = {};
var timestamp = null;
var lastMouseX = null;
var lastMouseY = null;
var mouseSpeedX = 0;
var mouseSpeedY = 0;
var threeDMousePos;
var numberOfPictures = 10;

document.addEventListener('DOMContentLoaded', function(event) { 
  init();
  animate();
});

function init() {
  var numPoints = 50;
  container = document.getElementById('app');
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 200;
  camera.rotation.order = 'YXZ';
  //camera.setLens(50, 32);
 
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x222222);
  container.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  onResize();
  window.addEventListener('resize', onResize, false);

  $('#app').bind('mousemove', onMouseMove);

  var loader = new THREE.JSONLoader(); // init the loader util
  loader.load('assets/js/models/frame-model.json', function (geometry) {
    frameGeometry = geometry;
    addAllPictures();
  });

  addLights();
}

function addAllPictures() {
  for (var i = 0; i < numberOfPictures; i++) {
    addPicture(0.3 - (i * 0.01));
  }

  for (var i = 0; i < objectArray.length; i++) {
    objectArray[i].position.z = (i * -50);
  }
}

function onMouseMove(e) {
  if (timestamp === null) {
    timestamp = Date.now();
    lastMouseX = e.screenX;
    lastMouseY = e.screenY;
    return;
  }

  var now = Date.now();
  var dt =  now - timestamp;
  var dx = e.screenX - lastMouseX;
  var dy = e.screenY - lastMouseY;
  var speedX = Math.round(dx / dt * 100);
  var speedY = Math.round(dy / dt * 100);

  mouseSpeedX = speedX;
  mouseSpeedY = speedY;

  timestamp = now;
  lastMouseX = e.screenX;
  lastMouseY = e.screenY;

  var vector = new THREE.Vector3();

  vector.set(
    ( event.clientX / window.innerWidth ) * 2 - 1,
    - ( event.clientY / window.innerHeight ) * 2 + 1,
    0.5 );

  vector.unproject( camera );

  var dir = vector.sub( camera.position ).normalize();
  var distance = - camera.position.z / dir.z;
  if (!threeDMousePos) {
    threeDMousePos = {};
  }
  threeDMousePos = camera.position.clone().add(dir.multiplyScalar(distance));
}

function addPicture(scale) {
  var group = new THREE.Object3D();
  var frame = createFrame(scale);
  var image = createImage(scale);
  
  group.add(frame);
  group.add(image);
  scene.add(group);

  objectArray.push(group);
}

function createFrame(scale) {
  var material = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('assets/images/textures/gold.jpg'),
    specular: '#302a07',
    color: '#4d450c',
    emissive: '#6b5f10',
    shininess: 100 
  });
  
  var mesh = new THREE.Mesh(frameGeometry, material);
  mesh.rotation.z = 1.57079633;
  mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
  mesh.overdraw = true;
  
  return mesh;
}

function createImage(scale) {
  var geometry = new THREE.PlaneBufferGeometry(321, 352, 32);
  var material = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('assets/images/textures/painting.jpg'),
    specular: '#302a07',
    color: '#4d450c',
    emissive: '#6b5f10',
    shininess: 100 
  });
  var plane = new THREE.Mesh( geometry, material );
  plane.scale.x = plane.scale.y = plane.scale.z = scale;
  
  return plane;
}

function addLights() {
  var ambientLight = new THREE.AmbientLight(0x000000);
  scene.add(ambientLight);
  
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);
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

  moveObjects();

  renderer.render( scene, camera );

}

function moveObjects() {
  var maxRotX = 0.4;
  var maxRotY = .5;
  var newRotY = mouseSpeedX / 300;
  if (newRotY >= maxRotY) {
    newRotY = maxRotY;
  }

  if (newRotY <= -maxRotY) {
    newRotY = -maxRotY;
  }

  var newRotX = mouseSpeedY / 300;

  if (newRotX >= maxRotX) {
    newRotX = maxRotX;
  }

  if (newRotX <= -maxRotX) {
    newRotX = -maxRotX;
  }

  for (var i = 0; i < objectArray.length; i++) {
    objectArray[i].rotation.x = newRotX;
    objectArray[i].rotation.y = newRotY;
    if (threeDMousePos) {
      objectArray[i].position.x = threeDMousePos.x;
      objectArray[i].position.y = threeDMousePos.y;
    }
  }
  
}

function checkRotation(){
  var x = camera.position.x,
    y = camera.position.y,
    z = camera.position.z;

  camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
  camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
    
  camera.lookAt(scene.position);  
}