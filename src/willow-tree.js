class WillowTree {

    constructor(scene, depth) {

        this.scene = scene;
        this.treeGroup = new THREE.Group();
        this.branchGeos = [];
        this.leafGeos = new Array(4).fill(0).map(() => new Array(0).fill(0));
        this.leafGroup = new THREE.Group();

        // resuable branch mesh
        this.branchGeo = new THREE.CylinderBufferGeometry(.6,1,1,8);
        this.branchMat = new THREE.MeshBasicMaterial({color: 0x000000});
        this.branch = new THREE.Mesh(this.branchGeo, this.branchMat);

        // meshline for leaves
        let meshLine = new MeshLine.MeshLine();
        
        // construct meshline / leaf geometry
        this.leafGeo = new THREE.Geometry();

        const numPoints = 48;
        
        for(let i = 0; i < numPoints; i++){
            this.leafGeo.vertices.push(new THREE.Vector3(
                i/numPoints,
                Math.sqrt(i/numPoints),
                0
                ));
            }
            
        // pass sine function to geometry to give it the leafy look
        meshLine.setGeometry(this.leafGeo, 
            (p) => {return 0.3 + Math.sin(numPoints*p);}
        );

        // construct an array of leaf materials
        this.leafMats = [];

        let leafColors = [0x6c933a, 0x658a1e, 0x46651d, 0x91ba55];

        for(let i = 0; i < leafColors.length; i++){
            this.leafMats[i] = new MeshLine.MeshLineMaterial({
                lineWidth: 0.2 + (Math.random() - 0.5) * 0.05,
                color: new THREE.Color(leafColors[i])
            });
        }

        // init reusable leaf mesh with a default material (it will be randomly assigned later)
       this.leaf = new THREE.Mesh(meshLine.geometry, this.leafMats[0]);

       this.generate(scene, depth);

       this.treeGroup.add(this.leafGroup);

       this.treeGroup.scale.set(1.5, 1.5, 1.5);

       scene.add(this.treeGroup);
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
        root.scale.set(1,3,1);
        root.translateY(root.scale.y / 2 + baseHeight);
        root.updateMatrixWorld();
        this.branchGeos.push(root.geometry.clone().applyMatrix(root.matrixWorld));

        // begin recursive generation
        this.addLayer(root, depth, maxDepth);

        // merge branch geos into a single buffergeo
        let branchGeo = THREE.BufferGeometryUtils.mergeBufferGeometries(this.branchGeos);
        let branches = new THREE.Mesh(branchGeo, this.branchMat);
        branchGeo.computeBoundingBox();
        this.treeGroup.add(branches);

        /*
        the following would merge all of the leaf geometries into 4 large buffergeos (1 for each material)
        however, when this is attempted, the resulting geometry loses some of it's characteristics ...
        the line material becomes more 2-dimensional and susceptible to shifts in camera perspective. idk.
        instead, for now, each individual leaf mesh is added to the scene.

        for(let i = 0; i < this.leafGeos.length; i++) {
            let geo = THREE.BufferGeometryUtils.mergeBufferGeometries(this.leafGeos[i]);
            geo.computeBoundingBox();
            let mesh = new THREE.Mesh(geo, this.leafMats[i]);
            this.treeGroup.add(mesh);
        }
        */

    }

    addLayer(child, depth, maxDepth){

        if (depth === maxDepth) {return};

        let widthScale = 0.6;
        let heightScale = Math.pow(1.025,depth);
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
                
                branch.translateY(child.scale.y / 2);
                branch.updateMatrix();

                branch.rotateX(1.1 * (Math.random() - 0.5));
                branch.rotateY(1.1 * (Math.random() - 0.5));
                branch.rotateZ(1.1 * (Math.random() - 0.5));

                branch.updateMatrix()
                branch.translateY(branch.scale.y / 2);

                // update matrices and copy geometry
                branch.updateMatrix();
                branch.updateMatrixWorld();
                this.branchGeos.push(branch.geometry.clone().applyMatrix(branch.matrixWorld));

                this.addLayer(branch, depth+1, maxDepth);
            }
        } else {
            if(0.8 > Math.random()){

                // clone the template, and rotate it 'downwards'
                let newLeaf = this.leaf.clone();
                newLeaf.rotateZ(-Math.PI/2);

                // final translations 'slides' the leaf from the middle of the branch to the end of it
                let finalTranslate = child.localToWorld(new THREE.Vector3(0,.5,0));
                newLeaf.position.copy(finalTranslate);
                
                // clone the leaf template and perform transformations to make the group of leaves look like willows
                let numClones = 48;
                for(let i = 0; i < numClones; i++){
                    let clone = newLeaf.clone()
                    clone.scale.set(
                        child.position.y * 0.7 + 2 * (Math.random() - 0.5),
                        Math.pow(1.9,(child.position.y/5)) - 2 + Math.random(),
                        1
                    );
                    clone.rotateX((i + (Math.random() - 0.5)) * 2 * Math.PI / numClones);

                    // assign a random material to give variety
                    let matNum = Math.floor(Math.random() * this.leafMats.length);
                    clone.material = this.leafMats[matNum];

                    clone.updateMatrixWorld();
                    this.leafGroup.add(clone);

                    /*
                    // unnecessary until merge issue is fixed
                    // push to leaf geo array
                    let cloneGeo = clone.geometry.clone(); // https://github.com/mrdoob/three.js/issues/14324
                    cloneGeo.applyMatrix(clone.matrixWorld);
                    this.leafGeos[matNum].push(cloneGeo);
                    */

                }

                return;

            } else {
                return;
            }
        }
    }

    update(d, e){
        this.uniforms.u_time.value = e;
    }
}

module.exports = WillowTree;