// three.js dependencies
const THREE = window.THREE = require('three');
require('three/examples/js/controls/OrbitControls.js');
require('three/examples/js/exporters/GLTFExporter.js');
require('three/examples/js/utils/BufferGeometryUtils');	

// trees
window.FruitTree = require('./src/fruit-tree.js');
window.SimpleTree = require('./src/simple-tree.js');
window.PineTree = require('./src/pine-tree.js');
window.WillowTree = require('./src/willow-tree.js');

// other
window.d3Chromatic = require('d3-scale-chromatic');
window.MeshLine = require('three.meshline');

// scene manager handles all things THREE.js
const SceneManager = require('./src/scene-manager');

// init the scene manager
const canvas = document.getElementById("canvas");
const manager = new SceneManager(canvas);

manager.init().then(() => {
	animate();
});

console.log(manager);

// handle all listeners
bindEventListeners();

function bindEventListeners() {
    window.addEventListener(
        'resize', 
        manager.onWindowResize(canvas.clientWidth, canvas.clientHeight), 
        false
	);

	// simple tree
	document.getElementById('dl_simple').onclick = () => {
		model = manager.scenes[0].userData.tree.treeGroup;
		exportModel(model, 'simple-tree');
	};
	document.getElementById('refresh_simple').onclick = () => {
		manager.regenerate('simple');
	};

	// fruit tree
	document.getElementById('dl_fruit').onclick = () => {
		model = manager.scenes[1].userData.tree.treeGroup;
		exportModel(model, 'fruit-tree');
	};
	document.getElementById('refresh_fruit').onclick = () => {
		manager.regenerate('fruit');
	};

	// pine tree
	document.getElementById('dl_pine').onclick = () => {
		model = manager.scenes[2].userData.tree.treeGroup;
		exportModel(model, 'pine-tree');
	};
	document.getElementById('refresh_pine').onclick = () => {
		manager.regenerate('pine');
	};

	// willow
	document.getElementById('dl_willow').onclick = () => {
		model = manager.scenes[3].userData.tree.treeGroup;
		exportModel(model, 'willow-tree');
	};
	document.getElementById('refresh_willow').onclick = () => {
		manager.regenerate('willow');
	};
} 

function animate() {
	render();
    requestAnimationFrame(animate);
}

function render() {
	manager.update();
}

function exportModel(subject, fileName){
	let exporter = new THREE.GLTFExporter();
	exporter.parse(subject, (obj) => {
		downloadGLTF(obj, fileName);
	});
}

function downloadGLTF(exportObj, exportName){
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
	var downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute("href",     dataStr);
	downloadAnchorNode.setAttribute("download", exportName + ".gltf");
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}