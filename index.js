// inspired by the @mrdoob sketch: https://threejs.org/editor/#file=https://mrdoob.neocities.org/030/app.json
const THREE = window.THREE = require('three');
const FirstPersonControls = require('./controls/first_person_controls.js');
const OrbitControls = require('./controls/orbit_controls.js');
const canvas = document.getElementById("canvas");

let camera, scene, renderer, camControls;
let treeGroup = new THREE.Group();
let leafGroup = new THREE.Group();
let clock = new THREE.Clock();

let leafGeo = new THREE.SphereGeometry(0.5,8,8);
let leafMat = new THREE.MeshBasicMaterial({color: 0x0000ff});
let leaf = new THREE.Mesh(leafGeo, leafMat);

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
	//camera.lookAt(new THREE.Vector3(0,5,0));

	//controls
	camControls = new THREE.OrbitControls(camera);
	camControls.autoRotate = true;

	generate(7);
	scene.add(treeGroup);
	scene.add(leafGroup);

}

function generate(maxDepth) {

	let depth = 1;

	let rootGeo = new THREE.BoxGeometry(1,1,1);
	let rootMat = new THREE.MeshBasicMaterial({color: 0x000000});
	let root = new THREE.Mesh(rootGeo, rootMat);
	root.scale.set(1,5,1);

	treeGroup.add(root);
	addLayer(root, depth, maxDepth);
	scene.add(treeGroup);

}

function addLayer(child, depth, maxDepth){

	if (depth === maxDepth) {return};

	let widthScale = 0.6;
	let heightScale = Math.pow(0.95,depth);

	let nBranches = (maxDepth-depth) - Math.floor(1.5*depth*Math.random());

	if(nBranches > 0) {
		for(let i = 0; i < nBranches; i++){

			let branch = child.clone();

			// set new branch size
			branch.scale.set(
				child.scale.x * widthScale, 
				child.scale.y * heightScale, 
				child.scale.z * widthScale
			);

			// move branch up
			branch.translateY(child.scale.y * (heightScale));

			// rotate branch
			let rotation = {
				x: Math.random() - 0.5,
				y: Math.random() - 0.5,
				z: Math.random() - 0.5
			};

			// rotate on z axis and adjust corresponding x offset
			branch.rotation.z += rotation.z;
			branch.translateX(-1*Math.sin(rotation.z)*(child.scale.y * heightScale)/2);

			// rotate on x axis and adjust corresponding z offsets
			branch.rotation.x += rotation.x;
			branch.translateZ(Math.sin(rotation.x)*(child.scale.y * heightScale)/2);

			treeGroup.add(branch);

			addLayer(branch, depth+1, maxDepth);
		}
	} else {
		if(0.7 > Math.random()){
			let newLeaf = leaf.clone();
			newLeaf.position.copy(child.position);
			//newLeaf.translateX(Math.cos(90 - child.rotation.z)*(child.scale.y * heightScale)/2);
			//newLeaf.translateY(child.scale.y * heightScale);
			//newLeaf.translateY(child.scale.y * heightScale/2);
			leafGroup.add(newLeaf);
			return;
		} else {
			return;
		}
	}

}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
	camControls.update(clock.getDelta());
	let t = 0.8;
	leafMat.color.setRGB(
		Math.cos(clock.getElapsedTime()*t),
		Math.tan(clock.getElapsedTime()*t),
		Math.sin(clock.getElapsedTime()*t));
    renderer.render(scene, camera);
}

function onWindowResize(newWidth, newHeight){
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}