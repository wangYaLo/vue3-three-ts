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
import {color, or, texture} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
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
import ResourceTracker from "@/utils/ResourceTracker";

// worker.postMessage(0);
// // 监听message事件
// worker.onmessage = (e) => {
//
//     worker.terminate()
// }
function init() {
    const resTrack = new ResourceTracker();
    const track = resTrack.track.bind(resTrack);
    const canvas = document.getElementById('c') as HTMLElement
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        logarithmicDepthBuffer: true
    })
    const fov = 60;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.z = 30;

    const scene = new THREE.Scene();

    const orbitControls = new OrbitControls(camera, canvas);
    orbitControls.enableDamping = true;
    orbitControls.target.set(0, 0, 0);

    const cellSize = 10
    const cell = new Uint8Array(cellSize * cellSize * cellSize)

    for ( let y = 0; y < cellSize; ++ y ) {

        for ( let z = 0; z < cellSize; ++ z ) {

            for ( let x = 0; x < cellSize; ++ x ) {

                const height = ( Math.sin( x / cellSize * Math.PI * 4 ) + Math.sin( z / cellSize * Math.PI * 6 ) ) * 20 + cellSize / 2;
                if ( height > y && height < y + 1 ) {

                    const offset = y * cellSize * cellSize +
                        z * cellSize +
                        x;
                    cell[ offset ] = 1;

                }

            }

        }

    }

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 'green' } );
    let num = 0
    for ( let y = 0; y < cellSize; ++ y ) {

        for ( let z = 0; z < cellSize; ++ z ) {

            for ( let x = 0; x < cellSize; ++ x ) {

                const offset = y * cellSize * cellSize +
                    z * cellSize +
                    x;
                const block = cell[ offset ];
                if ( block ) {

                    const mesh = new THREE.Mesh( geometry, material );
                    mesh.position.set( x, y, z );
                    scene.add( mesh );
                    num++
                }

            }

        }

    }
    console.log(num)

    let renderRequested = false

    function render(time) {
        renderRequested = false
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera)
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
    function requestRenderIfNotRequested() {
        if (!renderRequested) {
            renderRequested = true;
            requestAnimationFrame(render);
        }
    }
    orbitControls.addEventListener('change', requestRenderIfNotRequested)



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
