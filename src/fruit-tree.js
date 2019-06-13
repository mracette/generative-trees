class FruitTree {

    constructor(scene, depth) {

        this.treeGroup = new THREE.Group();

        this.uniforms = {
            u_time: {type: 'f', value: 1.0},
            u_resolution: {type: 'v2', value: new THREE.Vector2()},
            u_mouse: {type: 'v2', value: new THREE.Vector2()}
        };

        this.branchGeos = [];
        this.leafGeos = [];

        this.branchGeo = new THREE.CylinderBufferGeometry(.6,1,1,8);
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

        scene.add(this.treeGroup);

        this.generate(scene, depth);
    }

    generate(scene, maxDepth) {

        // set initial depth
        let depth = 1;

        // add a base
        let baseHeight = 1.5;
        let baseGeo = new THREE.CylinderBufferGeometry(1, 1.5, baseHeight, 8);
        baseGeo.translate(0, baseHeight/2, 0);
        this.branchGeos.push(baseGeo);

        // add 'root' branch
        let root = this.branch;
        root.scale.set(1,5,1);
        root.translateY(root.scale.y / 2 + baseHeight);
        root.updateMatrixWorld();
        this.branchGeos.push(root.geometry.clone().applyMatrix(root.matrixWorld));

        // begin recursive generation
        this.addLayer(root, depth, maxDepth);

        // merge buffer geos
        let branchGeo = THREE.BufferGeometryUtils.mergeBufferGeometries(this.branchGeos);
        let leafGeo = THREE.BufferGeometryUtils.mergeBufferGeometries(this.leafGeos);

        branchGeo.computeBoundingBox();
        leafGeo.computeBoundingBox();

        // merge vertices
        branchGeo = THREE.BufferGeometryUtils.mergeVertices(branchGeo, .001);

        // add color attribute
        let colors = [];

        for(let i = 0; i < this.leafGeos.length; i++){
            let color = new THREE.Color(d3Chromatic.interpolateWarm(Math.random()));
            for(let j = 0; j < this.leafGeo.getAttribute('position').count; j++){
                colors.push(color.r, color.g, color.b, 1);
            }
        }

        leafGeo.addAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(colors), 4));
        console.log(leafGeo);

        let leaves = new THREE.Mesh(leafGeo, this.leafShaderMat);
        let branches = new THREE.Mesh(branchGeo, this.branchMat);

        this.treeGroup.add(branches, leaves);
        this.treeGroup.scale.multiplyScalar(1.5);
        scene.add(this.treeGroup);

    }

    addLayer(child, depth, maxDepth){

        if (depth === maxDepth) {return};

        let widthScale = 0.6;
        let heightScale = Math.pow(0.95,depth);
        let nBranches = (maxDepth-depth) - Math.floor(1.5*depth*Math.random());
        
        if(depth === maxDepth - 1) {nBranches = 0;}

        //nBranches = 1;

        if(nBranches > 0) {
            for(let i = 0; i < nBranches; i++){

                let branch = child.clone();

                // set new branch size
                branch.scale.set(
                    child.scale.x * widthScale, 
                    child.scale.y * heightScale, 
                    child.scale.z * widthScale
                );
                
                branch.translateY(child.scale.y / 2);
                branch.updateMatrix();

                branch.rotateX(Math.random() - 0.5);
                branch.rotateY(Math.random() - 0.5);
                branch.rotateZ(Math.random() - 0.5);

                branch.updateMatrix()
                branch.translateY(branch.scale.y / 2);

                // update matrices and copy geometry
                branch.updateMatrix();
                branch.updateMatrixWorld();
                this.branchGeos.push(branch.geometry.clone().applyMatrix(branch.matrixWorld));

                this.addLayer(branch, depth+1, maxDepth);
            }
        } else {
            if(0.7 > Math.random()){

                let newLeaf = this.leaf.clone();

                newLeaf.position.copy(child.position);
                newLeaf.translateY(-0.5);
                
                newLeaf.updateMatrix();
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

module.exports = FruitTree;