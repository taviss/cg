var mapWidth = 10, mapLength = 10;

//
var scene, camera, controls, clock;
var renderer;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

//Viteza de miscare
const MOVE_SPEED = 100;
//Senzitivitatea mouse-ului
const LOOK_SPEED = 0.075;
//Marimea unei unitati(folosita la ziduri)
const SIZE = 100;

//Control
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var main = document.getElementById('main');

var colObjects = [];

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();


function maze(x,y) {
    var n=x*y-1;
    if (n<0) {alert("illegal maze dimensions");return;}
    var horiz=[]; for (var j= 0; j<x+1; j++) horiz[j]= [];
    var verti=[]; for (var j= 0; j<y+1; j++) verti[j]= [];
    var here= [Math.floor(Math.random()*x), Math.floor(Math.random()*y)];
    var path= [here];
    var unvisited= [];
    for (var j= 0; j<x+2; j++) {
        unvisited[j]= [];
        for (var k= 0; k<y+1; k++)
            unvisited[j].push(j>0 && j<x+1 && k>0 && (j != here[0]+1 || k != here[1]+1));
    }
    while (0<n) {
        var potential= [[here[0]+1, here[1]], [here[0],here[1]+1],
            [here[0]-1, here[1]], [here[0],here[1]-1]];
        var neighbors= [];
        for (var j= 0; j < 4; j++)
            if (unvisited[potential[j][0]+1][potential[j][1]+1])
                neighbors.push(potential[j]);
        if (neighbors.length) {
            n= n-1;
            next= neighbors[Math.floor(Math.random()*neighbors.length)];
            unvisited[next[0]+1][next[1]+1]= false;
            if (next[0] == here[0])
                horiz[next[0]][(next[1]+here[1]-1)/2]= true;
            else 
                verti[(next[0]+here[0]-1)/2][next[1]]= true;
            path.push(here= next);
        } else 
            here= path.pop();
    }
    return ({x: x, y: y, horiz: horiz, verti: verti});
}

function init() {
		
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0xD6F1FF, 0.0004);
	
	camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 10000);
	scene.add(camera);
	camera.position.y += 50
	
	clock = new THREE.Clock(true);
	
	controls = new THREE.PointerLockControls( camera );
	scene.add(controls.getObject());

	THREE.ImageUtils.crossOrigin = '';
	var floor = new THREE.Mesh(
			new THREE.CubeGeometry(mapWidth * SIZE * 3, 50, mapWidth * SIZE * 7),
			new THREE.MeshLambertMaterial({color: 0xEDCBA0, /*map: THREE.ImageUtils.loadTexture('textures/lava/lavatile.jpg')*/})
	);
	scene.add(floor);
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	var imagePrefix = "textures/sky/upt/";
	var directions  = ["posx", "negx", "zh", "negy", "posz", "negz"];
	var imageSuffix = ".jpg";
	var skyGeometry = new THREE.CubeGeometry( 5000, 7000, 5000 );	
	
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			color: 0xFF0000,
			//map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add( skyBox );

	
	var hemiLight = new THREE.HemisphereLight(); 
	scene.add(hemiLight);
	
	var wallHeight = 100;

	var cube = new THREE.CubeGeometry(SIZE, wallHeight, SIZE);
	var materials = [
	                 new THREE.MeshLambertMaterial({color: 0xFF0000, /*map: THREE.ImageUtils.loadTexture('textures/math/math1.jpg')*/}),
	                 new THREE.MeshLambertMaterial({color: 0xFF00FF, /*map: THREE.ImageUtils.loadTexture('textures/math/math2.jpg')*/}),
	                 new THREE.MeshLambertMaterial({color: 0xFFAB00, /*map: THREE.ImageUtils.loadTexture('textures/math/math3.jpg')*/}),
					 new THREE.MeshLambertMaterial({color: 0xFCCF00, /*map: THREE.ImageUtils.loadTexture('textures/math/math4.jpg')*/}),
	                 ];
	
	var m = maze(10, 10);
	for (var j= 0; j<m.x*2+1; j++) {
		var line= [];
		if (0 == j%2)
			for (var k=0; k<m.y*4+1; k++)
				if (0 == k%4) {
					var materialIndex = Math.floor((Math.random() * 4));
					var wall = new THREE.Mesh(cube, materials[materialIndex]);
					wall.position.x = (j - mapWidth/2) * SIZE;
					wall.position.y = wallHeight/2;
					wall.position.z = (k - mapWidth/2) * SIZE;
					scene.add(wall);
					colObjects.push(wall);
				}
				else {
					if (j>0 && m.verti[j/2-1][Math.floor(k/4)])
						line[k]= ' ';
					else {
						var materialIndex = Math.floor((Math.random() * 4));
						var wall = new THREE.Mesh(cube, materials[materialIndex]);
						wall.position.x = (j - mapWidth/2) * SIZE;
						wall.position.y = wallHeight/2;
						wall.position.z = (k - mapWidth/2) * SIZE;
						scene.add(wall);
						colObjects.push(wall);
					}
				}
		else
			for (var k=0; k<m.y*4+1; k++)
				if (0 == k%4)
					if (k>0 && m.horiz[(j-1)/2][k/4-1])
						line[k]= ' ';
					else {
						var materialIndex = Math.floor((Math.random() * 4));
						var wall = new THREE.Mesh(cube, materials[materialIndex]);
						wall.position.x = (j - mapWidth/2) * SIZE;
						wall.position.y = wallHeight/2;
						wall.position.z = (k - mapWidth/2) * SIZE;
						scene.add(wall);
						colObjects.push(wall);
					}
				else
					line[k]= ' ';
		if (0 == j) line[1]= line[2]= line[3]= ' ';
		if (m.x*2-1 == j) line[4*m.y]= ' ';
	}
	
	var onKeyDown = function ( event ) {
		if(!controlsEnabled) {
			start(false);
		}
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;
			case 37: // left
			case 65: // a
				moveLeft = true; break;
			case 40: // down
			case 83: // s
				moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				moveRight = true;
				break;
			case 32: // space
				if ( canJump === true ) velocity.y += 350;
					canJump = false;
					break;
		}
	};
	
	var onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
	};
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
	
	window.addEventListener( 'resize', onWindowResize, false );
	

	var element = document.body;
	element.addEventListener('click', start, false);
	
	
	renderer.domElement.style.backgroundColor = '#D6F1FF'; // easier to see
	document.body.appendChild(renderer.domElement);
	
	animate();
}

function start(event) {
	var element = document.body;
	element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
	element.requestPointerLock();
	controls.enabled = true;
	controlsEnabled = true;

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function distance(x1, y1, x2, y2) {
	return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

function animate () {
  requestAnimationFrame(animate);
  render();
}

function detectCollision(position) {
	var cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone();

	var rayCaster = new THREE.Raycaster(controls.getObject().position, cameraDirection);  

	var col = false;
	var intersects = rayCaster.intersectObjects(colObjects, true);  


	if ((intersects.length > 0 && intersects[0].distance < 50)) {

		console.log("COL");
		col = true;
	}
	return col;
}

function render() {
	if ( controlsEnabled ) {
		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;
			
		velocity.x -= velocity.x * 1.0 * delta;
		velocity.z -= velocity.z * 1.0 * delta;
		velocity.y -= 1.8 * 100.0 * delta; // 100.0 = mass
			

		if ( moveForward ) velocity.z -= 400.0 * delta;
		if ( moveBackward ) velocity.z += 400.0 * delta;
		if ( moveLeft ) velocity.x -= 400.0 * delta;
		if ( moveRight ) velocity.x += 400.0 * delta;
			
		
		var pos = controls.getObject().position.clone();
		console.log(pos);
		pos.x += velocity.x*delta;
		pos.y += velocity.y*delta;
		pos.z += velocity.z*delta;
		console.log(pos);
		
		
		if(!detectCollision(pos)) {
			controls.getObject().translateX( velocity.x * delta );
			controls.getObject().translateY( velocity.y * delta );
			controls.getObject().translateZ( velocity.z * delta );
			if ( controls.getObject().position.y < 10 ) {
				velocity.y = 0;
				controls.getObject().position.y = 10;
				canJump = true;
			}

		} else {
			velocity.x = 0;
			velocity.z = 0;
			velocity.y = 0;
		}
		prevTime = time;
		
	}
	renderer.render(scene, camera);
	//controls.update(clock.getDelta());
}