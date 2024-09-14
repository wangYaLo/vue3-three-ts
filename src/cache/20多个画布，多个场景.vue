<template>
    <canvas id="c">
    </canvas>
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

    function makeScene(elem) {
        const scene = new THREE.Scene();

        const fov = 45;
        const aspect = 2;  // the canvas default
        const near = 0.1;
        const far = 5;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.z = 2;
        camera.position.set(0, 1, 2);
        camera.lookAt(0, 0, 0);

        {
            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(-1, 2, 4);
            scene.add(light);
        }

        return {scene, camera, elem};
    }

    function setupScene1() {
        const sceneInfo = makeScene(document.querySelector(('#box')))
        //创建几何体
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        //创建材质
        const material = new THREE.MeshPhongMaterial({
        color: 'red'
        })
        //创建网格
        const mesh = new THREE.Mesh(geometry, material);
        sceneInfo.scene.add(mesh)
        sceneInfo.mesh = mesh
        return sceneInfo

    }

    function setupScene2() {
        const sceneInfo = makeScene(document.querySelector('#pyramid'));
        const radius = .8;
        const widthSegments = 4;
        const heightSegments = 2;
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const material = new THREE.MeshPhongMaterial({
            color: 'blue',
            flatShading: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        sceneInfo.scene.add(mesh);
        sceneInfo.mesh = mesh;
        return sceneInfo;
    }

    const sceneInfo1 = setupScene1();
    const sceneInfo2 = setupScene2();

    function renderSceneInfo(sceneInfo) {
        const { scene, camera, elem } = sceneInfo
        const {left, right, top, bottom, width, height} =
            elem.getBoundingClientRect();
        const isOffscreen =
            bottom < 0 ||
            top > renderer.domElement.clientHeight ||
            right < 0 ||
            left > renderer.domElement.clientWidth;
        if (isOffscreen) {
            return;
        }
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        const positiveYUpBottom = canvas.height - bottom;
        renderer.setScissor(left, positiveYUpBottom, width, height);
        renderer.setViewport(left, positiveYUpBottom, width, height);

        renderer.render(scene, camera);


    }

    function render(time) {
        time *= 0.01;

        resizeRendererToDisplaySize(renderer);

        renderer.setScissorTest(false);
        renderer.clear(true, true);
        renderer.setScissorTest(true);

        sceneInfo1.mesh.rotation.y = time * .1;
        sceneInfo2.mesh.rotation.y = time * .1;

        renderSceneInfo(sceneInfo1);
        renderSceneInfo(sceneInfo2);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

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
    position: fixed;
    left: 0;
    top: 0;
    display: block;
    z-index: -1;
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

.diagram {
    display: inline-block;
    width: 5em;
    height: 3em;
    border: 1px solid black;
}
.left {
    float: left;
    margin-right: .25em;
}
.right {
    float: right;
    margin-left: .25em;
}
</style>
