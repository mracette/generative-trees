// inspired by the @mrdoob sketch: https://threejs.org/editor/#file=https://mrdoob.neocities.org/030/app.json
const THREE = window.THREE = require('three');
const OrbitControls = require('./controls/orbit_controls.js');
const GLTFExporter = require('./gltf/GLTFExporter.js');
const GLTFLoader = require('./gltf/GLTFLoader.js');
const Tree = require('./tree.js');

let camera, scene, renderer, camControls, exporter;
let params = {
	depth: 7
};
let subjects = {};
let clock = new THREE.Clock();

const canvas = document.getElementById("canvas");

init();
bindEventListeners();
animate();

function bindEventListeners() {
    window.addEventListener(
        'resize', 
        onWindowResize(window.innerWidth, window.innerHeight), 
        false
	);
	document.getElementById('dl').onclick = () => {
		downloadObjectAsJson(subjects.tree, 'tree');
	};
	document.getElementById('generate').onclick = () => {
		scene.remove(scene.children[0]);
		subjects.tree = new Tree(scene, params.depth);
	};
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

	//exporter
	exporter = new THREE.GLTFExporter();

	//make a tree
	subjects.tree = new Tree(scene, params.depth);

}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
	let d = clock.getDelta();
	let e = clock.getElapsedTime();
	camControls.update(d);
	subjects.tree.update(d, e);
    renderer.render(scene, camera);
}

function onWindowResize(newWidth, newHeight){
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}

function exportModel(subject, fileName){
	exporter.parse(subject, (obj) => {
		downloadObjectAsJson(obj, fileName);
		console.log('Exported the following object: ' + obj);
	});
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".gltf");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }