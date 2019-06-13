class PineTree {

    constructor(scene, depth) {

        this.treeGroup = new THREE.Group();

        this.leafGeos = [];
        this.branchGeos = [];

        this.branchHeight = 35;
        this.branchGeo = new THREE.CylinderBufferGeometry(.1,1,this.branchHeight,8);
        this.branchMat = new THREE.MeshBasicMaterial({color: 0x000000});
        this.branchGeo.translate(0, this.branchHeight/2, 0);
        this.branchGeo.attributes.position.needsUpdate = true;
        this.branchGeos.push(this.branchGeo);

        this.leafGeo = new THREE.DodecahedronBufferGeometry(6,0);
        this.leafBasicMat = new THREE.MeshToonMaterial({color: 0x263e31, wireframe: false, shininess:0, diffuse: 1, specular: 0});
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

        // init leaf generation
        let startHeight = 3*this.branchHeight/8;
        let incHeight = (this.branchHeight - startHeight) / maxDepth;

        // generate leaves
        for(let i = 0; i < maxDepth; i++){

            let numShapes = (maxDepth - i) + 5 + Math.floor(Math.random() * 5);

            for(let j = 0; j < numShapes; j++){
                let scaleFactor = 0.35;
                let scale = new THREE.Vector3(
                    1 - (i/maxDepth) * 0.5, 
                    scaleFactor - (scaleFactor * (1-.1) * i/maxDepth), 
                    1 - (i/maxDepth) * 0.5
                );
                let clone = this.branchGeo.clone();
                clone.scale(scale.x, scale.y, scale.z);
                let rotationAmt = 2 * Math.PI/numShapes * (j + Math.random());
                //let rotation = new THREE.Vector3(this.branchHeight * scale.y,0,0).applyEuler(new THREE.Euler(0,rotationAmt,0));
                clone.rotateZ(5*Math.PI/8 + (i / maxDepth) * Math.PI/12 + Math.random() * Math.PI/12);
                clone.rotateY(rotationAmt);
                clone.translate(0, startHeight + (i + 1) / maxDepth * (this.branchHeight - startHeight), 0);
                clone.attributes.position.needsUpdate = true;
                clone.attributes.normal.needsUpdate = true;
                this.leafGeos.push(clone);
            }
        }
    }
}

module.exports = PineTree;