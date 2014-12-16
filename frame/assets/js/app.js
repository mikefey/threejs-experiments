var canvas;
var context;
var container, stats;
var camera, scene, renderer;
var rotSpeed = .005;
var frameScale = 0.3;

document.addEventListener('DOMContentLoaded', function(event) { 
  init();
  animate();
});

function init() {
  var numPoints = 50;
  container = document.getElementById('app');
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 500;
  camera.rotation.order = 'YXZ';
  camera.setLens(50, 32);
 
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x222222);
  container.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  onResize();
  window.addEventListener( 'resize', onResize, false );

  addFrame();
  addImage()
  addLights();
}

function addFrame() {
  var loader = new THREE.JSONLoader(); // init the loader util

  // init loading
  loader.load('assets/js/models/frame-model.json', function (geometry) {
    var material = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture('assets/images/textures/gold.jpg'),
      specular: '#302a07',
      color: '#4d450c',
      emissive: '#6b5f10',
      shininess: 100 
    });
    
    var mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.z = 1.57079633;
    mesh.scale.x = mesh.scale.y = mesh.scale.z = frameScale;

    mesh.overdraw = true;
    
    scene.add(mesh);
  });
}

function addImage() {
  var geometry = new THREE.PlaneGeometry(321, 352, 32 );
  //var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var material = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture('assets/images/textures/painting.jpg'),
      specular: '#302a07',
      color: '#4d450c',
      emissive: '#6b5f10',
      shininess: 100 
    });
  var plane = new THREE.Mesh( geometry, material );
  plane.position.z = -5;
  plane.scale.x = plane.scale.y = plane.scale.z = frameScale;
  scene.add( plane );
}

function addLights() {
  // add subtle ambient lighting
  var ambientLight = new THREE.AmbientLight(0x000000);
  scene.add(ambientLight);
  
  // directional lighting
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

  checkRotation();

  renderer.render( scene, camera );

}

function checkRotation(){
  var x = camera.position.x,
    y = camera.position.y,
    z = camera.position.z;

  camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
  camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
    
  camera.lookAt(scene.position);  
}