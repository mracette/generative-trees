// inspired by the @mrdoob sketch: https://threejs.org/editor/#file=https://mrdoob.neocities.org/030/app.json
const THREE = window.THREE = require('three');
const OrbitControls = require('./controls/orbit_controls.js');
const AppleTree = require('./apple_tree.js');
const canvas = document.getElementById("canvas");

let camera, scene, renderer, camControls;
let subjects = {};
let clock = new THREE.Clock();

init();
bindEventListeners();
animate();

function bindEventListeners() {
    window.addEventListener(
        'resize', 
        onWindowResize(window.innerWidth, window.innerHeight), 
        false
    );
} 

function init(){

	//scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color('#1F262F');

	//renderer
	renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true}); 
	const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
	renderer.setPixelRatio(DPR);
	renderer.setSize(canvas.width, canvas.height);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	//camera
	const aspectRatio = canvas.width / canvas.height;
	const fieldOfView = 60;
	const nearPlane = 1;
	const farPlane = 10000; 
	camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
	camera.position.set(0,0,50);
	camera.lookAt(new THREE.Vector3(0,5,0));

	//controls
	camControls = new THREE.OrbitControls(camera);
	camControls.autoRotate = true;

	//make a tree
	subjects.appleTree = new AppleTree(scene, 7);

}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
	let d = clock.getDelta();
	let e = clock.getElapsedTime();
	camControls.update(d);
	subjects.appleTree.update(d, e);
    renderer.render(scene, camera);
}

function onWindowResize(newWidth, newHeight){
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}