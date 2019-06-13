class SimpleTree {

    constructor(scene, depth) {

        this.treeGroup = new THREE.Group();

        this.leafGeos = [];
        this.branchGeos = [];

        this.branchHeight = 20;
        this.branchGeo = new THREE.CylinderBufferGeometry(.6,1,this.branchHeight,8);
        this.branchMat = new THREE.MeshBasicMaterial({color: 0x000000});
        this.branchGeo.translate(0, this.branchHeight/2, 0);
        this.branchGeo.attributes.position.needsUpdate = true;
        this.branchGeos.push(this.branchGeo);

        this.leafGeo = new THREE.DodecahedronBufferGeometry(6,0);
        this.leafBasicMat = new THREE.MeshStandardMaterial({color: 0x018156, wireframe: false, shininess:0, roughness: 1, metalness:0});
        this.leaf = new THREE.Mesh(this.leafGeo, this.leafBasicMat);

        this.generate(depth);

        // merge leaf geos
        let leafGeoMerged = THREE.BufferGeometryUtils.mergeBufferGeometries(this.leafGeos);
        let leaves = new THREE.Mesh(leafGeoMerged, this.leafBasicMat);
        leafGeoMerged.computeBoundingBox();

        // merge branch geos
        let branchGeoMerged = THREE.BufferGeometryUtils.mergeBufferGeometries(this.branchGeos);
        let branches = new THREE.Mesh(branchGeoMerged, this.branchMat);
        branchGeoMerged.computeBoundingBox();

        this.treeGroup.add(branches, leaves);

        scene.add(this.treeGroup);

    }

    generate(maxDepth) {
        
        // two small branches
        let b = this.branchGeo.clone();
        b.scale(0.3, 0.3, 0.3);
        b.rotateZ(Math.PI/4);
        b.translate(0, this.branchHeight/4 + this.branchHeight/20, 0);
        b.attributes.position.needsUpdate = true;
        this.branchGeos.push(b);

        let bb = this.branchGeo.clone();
        bb.scale(0.3, 0.3, 0.3);
        bb.rotateZ(-1*Math.PI/8);
        bb.translate(0, this.branchHeight/4, 0);
        bb.attributes.position.needsUpdate = true;
        this.branchGeos.push(bb);

        // init leaf generation
        let startHeight = this.branchHeight/5;
        let incHeight = this.branchHeight*(4/5)/maxDepth;

        // generate leaves
        for(let i = 0; i < maxDepth; i++){
            let numShapes = maxDepth - i;
            let radius = (this.branchHeight/4)*(1-(i+1)/maxDepth);
            let v = new THREE.Vector3(radius, 0, 0);
            for(let j = 0; j < numShapes; j++){
                let rotationAmt = 2 * Math.PI/numShapes * (j + Math.random());
                let rotation = new THREE.Vector3(radius,0,0).applyEuler(new THREE.Euler(0,rotationAmt,0));
                let scale = new THREE.Vector3(
                    1 + (Math.random() - 0.5)/4, 
                    1, 
                    1 + (Math.random() - 0.5)/4
                );
                let clone = this.leafGeo.clone();
                clone.translate(rotation.x, this.branchHeight/2 + startHeight + incHeight * i, rotation.z);
                clone.scale(scale.x, scale.y, scale.z);
                clone.attributes.position.needsUpdate = true;
                clone.attributes.normal.needsUpdate = true;
                this.leafGeos.push(clone);
            }
        }
    }
}

module.exports = SimpleTree;