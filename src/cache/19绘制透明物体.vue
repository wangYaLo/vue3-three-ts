<template>
    <canvas id="c">
    </canvas>
    <button id="screenshot" type="button">Save</button>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import {onMounted} from "vue";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import AxisGridHelper from "@/utils/AxisGridHelper";
import { GUI } from 'lil-gui'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {color} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import {RectAreaLightUniformsLib} from "three/examples/jsm/lights/RectAreaLightUniformsLib";
import {RectAreaLightHelper} from "three/examples/jsm/helpers/RectAreaLightHelper";
import MinMaxGUIHelper from "@/utils/helper/MinMaxGUIHelper";
import ColorGUIHelper from "@/utils/helper/ColorGUIHelper";
import DimensionGUIHelper from "@/utils/helper/DimensionGUIHelper";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";


// worker.postMessage(0);
// // 监听message事件
// worker.onmessage = (e) => {
//
//     worker.terminate()
// }
function init() {

    const canvas = document.getElementById('c') as HTMLElement

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        logarithmicDepthBuffer: true,
    })
    RectAreaLightUniformsLib.init();


    renderer.shadowMap.enabled = true

    //创建摄像机
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000)

    camera.position.z = 5;

    const scene = new THREE.Scene()

    scene.background = new THREE.Color('#FFFFFF')

    // const boxGeometry = new THREE.BoxGeometry(8, 8, 8);
    // const meshBasicMaterial = new THREE.MeshBasicMaterial({
    //     color: 0x44aa88
    // });
    // const mesh = new THREE.Mesh(boxGeometry, meshBasicMaterial);
    //
    // scene.add(mesh)
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    // const light = new THREE.PointLight(color, intensity);
    light.position.set(10, 10, 10);
    scene.add(light);


    const planeWidth = 1;
    const planeHeight = 1;
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    const loader = new THREE.TextureLoader();
    function makeInstance(geometry, color, rotY, rotX, url) {
        const base = new THREE.Object3D();
        scene.add(base)
        const texture = loader.load(url)
        const arr = [-1, 1]
        arr.forEach(x => {
            // texture.offset.x = x < 0 ? 0 : 0.5;
            // texture.repeat.x = .5;
            const material = new THREE.MeshBasicMaterial({
                color,
                map: texture,
                transparent: true,
                alphaTest: 0.5  ,
                side: THREE.DoubleSide,
            });

            const mesh = new THREE.Mesh(geometry, material);
            console.log(x)
            if (x === 1) {
                mesh.rotation.y = Math.PI * .5;
            }
            base.add(mesh)
            base.position.z = rotY
            base.position.x = rotX
            // mesh.position.x = x * .25;
        })
    }
    // makeInstance(geometry, 'white', Math.PI * 0.5, 'src/assets/image/tree-02.png')

    for (let i = 0; i < 5; i+=.5) {
        for (let j = 0; j < 5; j+=.5) {
            makeInstance(geometry, 'white', i - 5, j - 5, 'src/assets/image/tree-02.png')
        }
    }

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0)
    controls.enableDamping = true;


    let renderRequested = false;
    function render(time) {
        time *= 0.001
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderRequested = false;
        controls.update()
        renderer.render(scene, camera);
        // requestAnimationFrame(render);
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    // requestAnimationFrame(render)

    requestRenderIfNotRequested()
    function requestRenderIfNotRequested() {
        if (!renderRequested) {
            renderRequested = true;
            requestAnimationFrame(render);
        }
    }
    controls.addEventListener('change', requestRenderIfNotRequested)




}

onMounted(() => {
    init()
})
</script>

<style scoped>
#app {
    margin: 0;
    padding: 0;
}
#c {
    width: 100vw;
    height: 100vh;
}
.split {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
}
.split>div {
    width: 100%;
    height: 100%;
}
#screenshot {
    position: absolute;
    top: 20px;
    left: 20px;
}
</style>
