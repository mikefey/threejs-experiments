var canvas;
var context;
var container, stats;
var camera, scene, renderer;
var rotSpeed = .005;
var showIteration = 0;
var showTimer = 0;
var lines = [];
var timeBetweenLines = 10;
var flash = true;
var spheres = [];

document.addEventListener('DOMContentLoaded', function(event) { 
  init();
  animate();
});

function init() {
  var numPoints = 50;
  container = document.getElementById('app');
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 500;
 
  scene = new THREE.Scene();

  var positionArray = arrangeInSphere(numPoints, 170);

  for (var i = 0; i < numPoints; i++) {
    var sphere = new THREE.Mesh(new THREE.CircleGeometry(2, 20), new THREE.MeshBasicMaterial({color: 0x871dec}));
    scene.add(sphere);
    spheres.push(sphere);
    sphere.position.set(positionArray[i][0], positionArray[i][1], positionArray[i][2]);
  }

  for (var i = 0; i < positionArray.length; i++) {
    var randColor = Math.floor(Math.random()*16777215);
    var lineMaterial = new THREE.LineBasicMaterial({
      color: randColor,
      transparent: true
    });
    var lineGeometry = new THREE.Geometry();

    for (var ii = 0; ii < positionArray.length; ii++) {
      lineGeometry.vertices.push(new THREE.Vector3(positionArray[i][0], positionArray[i][1], positionArray[i][2]));
      lineGeometry.vertices.push(new THREE.Vector3(positionArray[ii][0], positionArray[ii][1], positionArray[ii][2]));
      if (ii == positionArray.length - 1) {
        lineGeometry.vertices.push(lineGeometry.vertices[0]);
      }
    }

    var line = new THREE.Line(lineGeometry, lineMaterial);
    if (flash) {
      line.material.opacity = 0.1;
    }
    lines.push(line);
    scene.add(line);
  }

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x222222);
  container.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  onResize();
  window.addEventListener( 'resize', onResize, false );
}

function arrangeInSphere(numberOfPoints, scale) {
  var points = new Array();
  var inc = Math.PI * (3 - Math.sqrt(5));
  var off = 2.0 / numberOfPoints;
 
  for (var k = 0; k < numberOfPoints; k++){
    var x;
    var y;
    var z;
    var r;
    var phi;
    
    y = k * off - 1 + (off / 2);
    r = Math.sqrt(1 - y * y);
    phi = k * inc;
    x = Math.cos(phi) * r;
    z = Math.sin(phi) * r;
     
    points.push([x * scale, y * scale, z * scale]);
  }
        
  return points;
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame( animate );

  if (flash) {
    showTimer++;
    if (showTimer >= timeBetweenLines) {
      var prev = lines[showIteration - 1];
      if (showIteration == 0) {
        prev = lines[lines.length - 1];
      }
      showTimer = 0;
      showIteration++;
      if (showIteration > lines.length - 1) {
        showIteration = 0;
      }

      prev.material.opacity = 0.1;
      lines[showIteration].material.opacity = 1;
    }
  }
  
  render();
  stats.update();
}

function render() {
  checkRotation();

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

  for (var i = 0; i < spheres.length; i++) {
    spheres[i].lookAt( camera.position );
  }

  camera.lookAt(scene.position);  
}