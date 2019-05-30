// inspired by the @mrdoob sketch: https://threejs.org/editor/#file=https://mrdoob.neocities.org/030/app.json
const THREE = window.THREE = require('three');
const OrbitControls = require('./controls/orbit_controls.js');
const GLTFExporter = require('./gltf/GLTFExporter.js');
const GLTFLoader = require('./gltf/GLTFLoader.js');
const AppleTree = require('./apple_tree.js');

let camera, scene, renderer, camControls, exporter;
let currentModel;
let subjects = {};
let clock = new THREE.Clock();

const canvas = document.getElementById("canvas");
const dlButton = document.getElementById("dl");

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
	//scene.background = new THREE.Color('#1F262F');
	scene.background = new THREE.Color('#FFFFFF');

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
	subjects.appleTree = new AppleTree(scene, 7);
	//exportModel(subjects.appleTree.treeGroup, 'apple-tree');

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
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }