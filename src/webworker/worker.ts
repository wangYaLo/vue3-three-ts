import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {Raycaster} from "three";
const handlers = {
    main,
    size
}

const state = {
    width: 300,  // canvas default
    height: 150,  // canvas default
};

self.onmessage = function (e) {



    // util[e.data.name](e.data.params)
    const fn = handlers[e.data.type];
    if (typeof fn !== 'function') {
        throw new Error('no handler for type: ' + e.data.type);
    }
    fn(e.data);
}

function main(data) {
    const { canvas } = data;
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    console.log(state)
    const camera = new THREE.PerspectiveCamera(60,  // fov
        state.width / state.height,   // aspect
        0.1, // near
        60,);

    camera.position.z = 10;

    /**
     * 创建一个场景
     */
    const scene = new THREE.Scene()

    // const controls = new OrbitControls(camera, canvas);
    // controls.target.set(0, 0, 0)
    // controls.enableDamping = true;
    // controls.update()

    function makeInstance(geometry, color, x) {
        //根据color创建一个材质
        const material = new THREE.MeshBasicMaterial({
            color
        })
        //创建一个网格对象
        const cube = new THREE.Mesh(geometry, material);

        cube.position.x = x

        scene.add(cube);

        return cube;

    }

    const boxLength = 1;
    const geometry = new THREE.BoxGeometry(boxLength, boxLength, boxLength);

    let cubes = [
        makeInstance(geometry, 'green',  0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844,  2)
    ]

    renderer.render(scene, camera);
    let renderRequested = false;
    function render(time) {
        time *= 0.001;
        renderRequested = false;
        if (resizeRendererToDisplaySize(renderer)) {
            camera.aspect = state.width / state.height;
            camera.updateProjectionMatrix();
        }

        cubes.forEach(cube => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
        })

        renderer.render(scene, camera);

        requestAnimationFrame(render)
    }

    render()


    // function requestRenderIfNotRequested() {
    //     if (!renderRequested) {
    //         renderRequested = true;
    //         requestAnimationFrame(render);
    //     }
    // }
    //
    // requestRenderIfNotRequested()

}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = state.width;
    const height = state.height;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function size(data) {
    state.width = data.width;
    state.height = data.height;
}

class PickHelper {
    private raycaster: Raycaster;
    private pickedObject: any;
    private pickedObjectSavedColor: number;
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
    }
    pick(normalizedPosition, scene, camera, time) {
        // restore the color if there is a picked object
        if (this.pickedObject) {
            this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
            this.pickedObject = undefined;
        }

        // cast a ray through the frustum
        this.raycaster.setFromCamera(normalizedPosition, camera);
        // get the list of objects the ray intersected
        const intersectedObjects = this.raycaster.intersectObjects(scene.children);
        if (intersectedObjects.length) {
            // pick the first object. It's the closest one
            this.pickedObject = intersectedObjects[0].object;
            // save its color
            this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
            // set its emissive color to flashing red/yellow
            this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
        }
    }
}

const pickPosition = {x: 0, y: 0};
const pickHelper = new PickHelper();