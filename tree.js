require('three/examples/js/utils/BufferGeometryUtils');

class Tree {

    constructor(scene, depth) {

        this.treeGroup = new THREE.Group();

        console.log(typeof this.getFragmentShader());

        this.uniforms = {
            u_time: {type: 'f', value: 1.0},
            u_resolution: {type: 'v2', value: new THREE.Vector2()},
            u_mouse: {type: 'v2', value: new THREE.Vector2()}
        };

        this.branchGeos = [];
        this.leafGeos = [];

        this.branchGeo = new THREE.BoxBufferGeometry(1,1,1);
        this.branchMat = new THREE.MeshBasicMaterial({color: 0x000000});
        this.branch = new THREE.Mesh(this.branchGeo, this.branchMat);

        this.leafGeo = new THREE.SphereBufferGeometry(0.5,8,8);
        this.leafBasicMat = new THREE.MeshBasicMaterial({color: 0x0000ff});
        this.leaf = new THREE.Mesh(this.leafGeo, this.leafBasicMat);

        let vertexShader = this.getVertexShader();
        let fragmentShader = this.getFragmentShader();

        this.leafShaderMat = new THREE.RawShaderMaterial({
            uniforms: this.uniforms,
            fragmentShader: fragmentShader,
            vertexShader: vertexShader
        })

        this.generate(scene, depth);
    }

    generate(scene, maxDepth) {

        // set initial depth
        let depth = 1;

        // add 'root' branch
        let root = this.branch;
        root.scale.set(1,5,1);
        root.updateMatrixWorld();
        this.branchGeos.push(root.geometry.clone().applyMatrix(root.matrixWorld));

        // begin recursive generation
        this.addLayer(root, depth, maxDepth);

        // merge buffer geos
        let branchGeo = THREE.BufferGeometryUtils.mergeBufferGeometries(this.branchGeos);
        let leafGeo = THREE.BufferGeometryUtils.mergeBufferGeometries(this.leafGeos);

        // merge vertices
        branchGeo = THREE.BufferGeometryUtils.mergeVertices(branchGeo, .001);

        // add color attribute
        let colors = [];

        for(let i = 0; i < this.leafGeos.length; i++){
            let r = Math.random();
            let g = Math.random();
            let b = Math.random();
            for(let j = 0; j < this.leafGeo.getAttribute('position').count * 3; j++){
                colors.push(r, g, b, 1);
            }
        }

        leafGeo.addAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(colors), 4));
        console.log(leafGeo);

        let leaves = new THREE.Mesh(leafGeo, this.leafShaderMat);
        let branches = new THREE.Mesh(branchGeo, this.branchMat);

        let tree = new THREE.Group().add(leaves, branches);
        console.log(tree);
        scene.add(tree);

    }

    addLayer(child, depth, maxDepth){

        if (depth === maxDepth) {return};

        let widthScale = 0.6;
        let heightScale = Math.pow(0.95,depth);
        let nBranches = (maxDepth-depth) - Math.floor(1.5*depth*Math.random());
        
        if(depth === maxDepth - 1) {nBranches = 0;}

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
                branch.translateX(-0.5 * child.scale.y * heightScale * Math.sin(rotation.z));
                branch.translateY(0.5 * branch.scale.y * heightScale * (Math.cos(rotation.z) - 1));

                // rotate on x axis and adjust corresponding z offsets
                branch.rotation.x += rotation.x;
                branch.translateZ(0.5 * child.scale.y * heightScale * Math.sin(rotation.x));
                branch.translateY(0.5 * child.scale.y * heightScale * (Math.cos(rotation.x) - 1));

                branch.updateMatrixWorld();
                this.branchGeos.push(branch.geometry.clone().applyMatrix(branch.matrixWorld));

                this.addLayer(branch, depth+1, maxDepth);
            }
        } else {
            if(0.7 > Math.random()){

                let newLeaf = this.leaf.clone();

                //copy position of the last branch
                newLeaf.position.copy(child.position);

                //move to the tip of the branch (based on x-rotation)
                newLeaf.translateY(0.5 * child.scale.y * (Math.cos(child.rotation.x)));
                newLeaf.translateZ(0.5 * child.scale.y  * Math.sin(child.rotation.x))

                //move to the tip of the branch (based on z-rotation)
                newLeaf.translateY(0.5 * child.scale.y * (Math.cos(child.rotation.z) - 1));
                newLeaf.translateX(-0.5 * child.scale.y  * Math.sin(child.rotation.z));

                newLeaf.updateMatrixWorld();
                this.leafGeos.push(newLeaf.geometry.clone().applyMatrix(newLeaf.matrixWorld));

                return;

            } else {
                return;
            }
        }
    }

    update(d, e){
        this.uniforms.u_time.value = e;
    }

    getVertexShader(){
        return `
        #ifdef GL_ES
        precision mediump float;
        #endif

        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform vec2 u_resolution;

        attribute vec3 position;
        attribute vec4 color;

        varying vec4 vColor;

        void main() {
            vColor = color;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `;
    }

    getFragmentShader(){
        return `
        #ifdef GL_ES
        precision mediump float;
        #endif

        uniform vec2 u_resolution;
        uniform float u_time;

        varying vec4 vColor;

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            gl_FragColor = vColor;
            float glow = 0.2;
            gl_FragColor = vec4(
                mix(vColor.x, 1., glow * sin(u_time*1.)),
                mix(vColor.y, 1., glow * cos(u_time*2.)),
                mix(vColor.z, 1., glow * sin(u_time*5.)),
                1.
             );
        }
        `;
    }

}

module.exports = Tree;