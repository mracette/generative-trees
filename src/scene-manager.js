class SceneManager {
    constructor(canvas){
        this.scenes = [];
        this.clock = new THREE.Clock(true);
        this.screenDimensions = {
            width: canvas.width,
            height: canvas.height
        }
        this.worldDimensions = {
            width: 1000,
            height: 1000,
            depth: 1000
        };
    }

    init() {
        return new Promise((resolve, reject) => {
            try {
                // lights, camera, action
                this.scene = this.initScene();
                this.renderer = this.initRender();
                this.camera = this.initCamera();
                this.lights = this.initLights();
                this.controls = this.initControls();
                this.helpers = this.initHelpers();
                this.scenes = this.initScenes();
                resolve();
            } catch(e) {
                console.error(e);
                reject(e)
            }
        })
    }

    initScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#1F262F');
        return scene;
    }

    initScenes(){
        let scenes = [];
        let content = document.getElementById("content");
        for(let i = 0; i < 4; i++){

            let scene = new THREE.Scene();
            let tree, name, id, github;
            let bbIndex, bbOffset;

            switch(i){
                case 0: 
                    name = 'Simple Tree';
                    id = 'simple';
                    github = "";
                    tree = new SimpleTree(scene, 3);
                    bbIndex = 0;
                    bbOffset = 5;
                    break;
                case 1: 
                    name = 'Fruit Tree';
                    id = 'fruit';
                    github = "";
                    tree = new FruitTree(scene, 7);
                    bbIndex = 0;
                    bbOffset = 5;
                    break;
                case 2: 
                    name = 'Pine Tree';
                    id = 'pine';
                    github = "";
                    tree = new PineTree(scene, 15);
                    bbIndex = 0;
                    bbOffset = 0;
                    break;
                case 3: 
                    name = 'Willow Tree';
                    id = 'willow';
                    github = "";
                    tree = new WillowTree(scene, 6);
                    bbIndex = 0;
                    bbOffset = 3;
                    break;
            }

            let el = document.createElement("div");
            el.className = "list-item";
            el.innerHTML = `
            <div class="scene"></div>
            <div class="description"><b>${name}</b>
             | <a href="${github}">Github</a>
             | <a href="javascript:void(0);" id="dl_${id}">Export GLTF</a>
             | <a href="javascript:void(0);" id="refresh_${id}">Regenerate</a>
            </div>
            `;
            content.append(el);

            scene.userData.tree = tree;

            let camera = this.camera.clone();
            scene.userData.camera = camera;

            scene.userData.element = el.querySelector(".scene");
            let controls = new THREE.OrbitControls(scene.userData.camera, scene.userData.element);
            
            let bb = tree.treeGroup.children[bbIndex].geometry.boundingBox;
            controls.target = bb.max.lerp(bb.min, 0.5);
            controls.target.y += bbOffset;
            scene.userData.controls = controls;

            this.addLights(scene);

            scenes.push(scene);

        }
        return scenes;
    }

    initRender() {
        const renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
        renderer.setClearColor( 0xffffff, 1 );
        renderer.setPixelRatio( window.devicePixelRatio );

        return renderer;
    }

    initCamera() {
        const fieldOfView = 60;
        const nearPlane = 1;
        const farPlane = 1000; 
        const camera = new THREE.PerspectiveCamera(fieldOfView, 1, nearPlane, farPlane);
        camera.position.set(0, 10, 50);
        return camera;
    }

    initLights(){
        const lights = {
            ambient: new THREE.AmbientLight(0xffffff, 0.3),
            directional: new THREE.DirectionalLight(0xffffff, 1)
        };
        lights.directional.position.set(50,50,50);
        this.scene.add(lights.ambient);
        return lights;
    }

    addLights(scene){
        let aLight = this.lights.ambient.clone();
        let dLight = this.lights.directional.clone();
        scene.add(aLight, dLight);
    }

    initSubjects(){
        const subjects = {
            simpleTree: new SimpleTree(this.scene, 3)
        };
        return subjects;
    }

    initControls() {
        const controls = {
            camControls: new THREE.OrbitControls(this.camera)
        };
        controls.camControls.autoRotate = true;
        controls.camControls.target = new THREE.Vector3(0,10,0);
        return controls;
    }

    initHelpers() {
        const helpers = {
            exporter: new THREE.GLTFExporter()
        }
        return helpers;
    }
    
    regenerate(subject) {
        let scene;
        switch(subject){
            case 'simple':
                scene = this.scenes[0];
                scene.remove.apply(scene, scene.children);
                scene.userData.tree = new SimpleTree(this.scenes[0], 3);
                this.addLights(scene);
                break;
            case 'fruit':
                scene = this.scenes[1];
                scene.remove.apply(scene, scene.children);
                scene.userData.tree = new FruitTree(this.scenes[1], 7);
                this.addLights(scene);
                break;
            case 'pine':
                scene = this.scenes[2];
                scene.remove.apply(scene, scene.children);
                scene.userData.tree = new PineTree(this.scenes[2], 15);
                this.addLights(scene);
                break;
            case 'willow':
                scene = this.scenes[3];
                scene.remove.apply(scene, scene.children);
                scene.userData.tree = new WillowTree(this.scenes[3], 6);
                this.addLights(scene);
                break;
            default:
                console.warning("Error: can't regenerate the specified model.")
                break;
        }
    }

    update() {

        let d = this.clock.getDelta();
        let e = this.clock.getElapsedTime();

        this.renderer.setClearColor( 0xffffff );
        this.renderer.setScissorTest( false );
        this.renderer.clear();
        this.renderer.setClearColor( 0xe0e0e0 );
        this.renderer.setScissorTest( true );

        for(let i = 0; i < this.scenes.length; i++){

            let scene = this.scenes[i];

            canvas.style.transform = `translateY(${window.scrollY}px)`;

            // get the element that is a place holder for where we want to
            // draw the scene
            var element = scene.userData.element;

            // get its position relative to the page's viewport
            var rect = element.getBoundingClientRect();

            // set the viewport
            var width = rect.right - rect.left;
            var height = rect.bottom - rect.top;
            var left = rect.left;
            var bottom = this.renderer.domElement.clientHeight - rect.bottom;

            this.renderer.setViewport( left, bottom, width, height );
            this.renderer.setScissor( left, bottom, width, height );

            scene.userData.controls.update(d);
            scene.children[0].rotateY(.004);

            this.renderer.render(scene, scene.userData.camera);
        }
    }

    onWindowResize(newWidth, newHeight){
        // reset screen dimensions
        this.screenDimensions.width = newWidth;
        this.screenDimensions.height = newHeight;
        this.camera.aspect = this.screenDimensions.width / this.screenDimensions.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.screenDimensions.width, this.screenDimensions.height);
    }
};

module.exports = SceneManager;