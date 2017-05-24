var map = [ // 1  2  3  4  5  6  7  8  9
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 0
           [1, 1, 0, 0, 0, 0, 0, 1, 1, 1,], // 1
           [1, 1, 0, 0, 2, 0, 0, 0, 0, 1,], // 2
           [1, 0, 0, 0, 0, 2, 0, 0, 0, 1,], // 3
           [1, 0, 0, 2, 0, 0, 2, 0, 0, 1,], // 4
           [1, 0, 0, 0, 2, 0, 0, 0, 1, 1,], // 5
           [1, 1, 1, 0, 0, 0, 0, 1, 1, 1,], // 6
           [1, 1, 1, 0, 0, 1, 0, 0, 1, 1,], // 7
           [1, 1, 1, 1, 1, 1, 0, 0, 1, 1,], // 8
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 9
           ], mapW = map.length, mapH = map[0].length;
	
var scene, camera, controls, clock;
var renderer;

const MOVE_SPEED = 100;
const LOOK_SPEED = 0.075;

function init() {
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0xD6F1FF, 0.0005); // color, density
	
	camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 10000);
	scene.add(camera);
	
	clock = new THREE.Clock(true);
	
	/*
	controls = new THREE.FirstPersonControls(camera);
	controls.movementSpeed = MOVE_SPEED;
	controls.lookSpeed = LOOK_SPEED;
	controls.lookVertical = false; // Temporary solution; play on flat surfaces only
	controls.noFly = true;*/
	
	var dummy = new THREE.Object3D();
	controls = new THREE.FlyControls( dummy );
	controls.movementSpeed = 100;
    controls.domElement = document.body;
    controls.rollSpeed = 0.5;
    controls.autoForward = false;
    controls.dragToLook = true;
	
	scene.add(dummy);
    dummy.add(camera);


	
	var floor = new THREE.Mesh(
			new THREE.CubeGeometry(mapW * 250, 10, mapW * 250),
			new THREE.MeshLambertMaterial({color: 0xEDCBA0,/*map: THREE.ImageUtils.loadTexture('images/floor-1.jpg')*/})
	);
	scene.add(floor);
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	renderer.domElement.style.backgroundColor = '#D6F1FF'; // easier to see
	document.body.appendChild(renderer.domElement);
	
	// Health cube
	var healthcube = new THREE.Mesh(
			new THREE.CubeGeometry(30, 30, 30),
			new THREE.MeshBasicMaterial({color: 0x00FF00})
	);
	healthcube.position.set(-250-15, 35, -250-15);
	scene.add(healthcube);
	
	var directionalLight1 = new THREE.DirectionalLight( 0xF7EFBE, 0.7 );
	directionalLight1.position.set( 0.5, 1, 0.5 );
	scene.add( directionalLight1 );
	var directionalLight2 = new THREE.DirectionalLight( 0xF7EFBE, 0.5 );
	directionalLight2.position.set( -0.5, -1, -0.5 );
	scene.add( directionalLight2 );
	
	animate();
}

function animate () {
  // Schedule the next frame.
  requestAnimationFrame(animate);
  
  render();
  
  //controls.update(clock.getDelta());
}

function render() {
	renderer.render(scene, camera);
	controls.update(clock.getDelta());
}