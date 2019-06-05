
class Tree {

    constructor(scene, depth) {
        this.branchGroup = new THREE.Group();
        this.leafGroup = new THREE.Group();
        this.treeGroup = new THREE.Group();

        let rootGeo = new THREE.BoxGeometry(1,1,1);
        this.rootMat = new THREE.MeshBasicMaterial({color: 0x000000});
        this.root = new THREE.Mesh(rootGeo, this.rootMat);
        this.root.scale.set(1,5,1);

        let leafGeo = new THREE.SphereGeometry(0.5,8,8);
        this.leafMat = new THREE.MeshBasicMaterial({color: 0x0000ff});
        this.leaf = new THREE.Mesh(leafGeo, this.leafMat);

        this.generate(scene, depth);
    }

    generate(scene, maxDepth) {

        // set initial depth
        let depth = 1;

        // add 'root' branch
        this.branchGroup.add(this.root);

        // begin recursive generation
        this.addLayer(this.root, depth, maxDepth);

        // add branch and leaf groups to the tree group
        this.treeGroup.add(this.leafGroup);
        this.treeGroup.add(this.branchGroup);

        // add to scene
        scene.add(this.treeGroup);

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

                this.branchGroup.add(branch);

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

                this.leafGroup.add(newLeaf);
                return;
            } else {
                return;
            }
        }
    }

    update(d, e) {
        let t = 0.8;
        this.leafMat.color.setRGB(
            Math.cos(e*t),
            Math.tan(e*t),
            Math.sin(e*t)
        );
    }

}

module.exports = Tree;