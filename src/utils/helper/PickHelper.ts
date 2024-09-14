import * as THREE from 'three'
import {Raycaster} from "three";


class PickHelper {
    private raycaster: Raycaster;
    private pickedObjectSavedColor: number;
    private pickedObject: any;
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
    }
    pick(normalizedPosition, scene, camera, time) {
        if (this.pickedObject) {
            this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
            this.pickedObject = undefined;
        }
        //发出射线
        this.raycaster.setFromCamera(normalizedPosition, camera);
        //获取与射线相交的对象
        const intersectObjects = this.raycaster.intersectObjects(scene.children);
        if (intersectObjects.length) {
            //找到第一个对象，这是离鼠标最近的对象
            this.pickedObject = intersectObjects[0].object;
            //保存他的颜色
            this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
            //
            this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
        }
    }
}

export default PickHelper