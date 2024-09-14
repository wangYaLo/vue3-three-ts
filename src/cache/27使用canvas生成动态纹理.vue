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
import {color, texture} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import {RectAreaLightUniformsLib} from "three/examples/jsm/lights/RectAreaLightUniformsLib";
import {RectAreaLightHelper} from "three/examples/jsm/helpers/RectAreaLightHelper";
import MinMaxGUIHelper from "@/utils/helper/MinMaxGUIHelper";
import ColorGUIHelper from "@/utils/helper/ColorGUIHelper";
import DimensionGUIHelper from "@/utils/helper/DimensionGUIHelper";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import PickHelper from "@/utils/helper/PickHelper";
import GPUPickHelper from "@/utils/helper/GPUPickHelper";
import countryInfos from '@/assets/json/country.json'

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
        logarithmicDepthBuffer: true
    })
    const fov = 60;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 200;
    const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.z = 30;

    const scene = new THREE.Scene();
    //create canvas
    const ctx = document.createElement('canvas').getContext('2d')
    ctx.canvas.width = 256;
    ctx.canvas.height = 256;
    ctx.fillStyle = '#FFF'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    const texture = new THREE.CanvasTexture(ctx.canvas)

    const material = new THREE.MeshBasicMaterial({
        map: texture
    })

    const boxGeometry = new THREE.BoxGeometry(8, 8, 8);

    const cube = new THREE.Mesh(boxGeometry, material)
    scene.add(cube)

    function randInt(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min | 0;
    }

    function drawRandomDot() {
        ctx.fillStyle = `#${randInt(0x1000000).toString(16).padStart(6, '0')}`;
        ctx.beginPath();

        const x = randInt(256);
        const y = randInt(256)

        const radius = randInt(10, 64)

        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }


    function render(time) {
        drawRandomDot()
        texture.needsUpdate = true;
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        cube.rotation.x = time * 0.001
        cube.rotation.y = time * 0.001
        renderer.render(scene, camera)
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    function resizeRendererToDisplaySize( renderer ) {

        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if ( needResize ) {

            renderer.setSize( width, height, false );

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
