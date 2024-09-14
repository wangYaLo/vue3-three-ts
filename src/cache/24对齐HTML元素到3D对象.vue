<template>
    <div id="container">
        <canvas id="c"></canvas>
        <div id="labels" class="labels">
            <div>1</div>
            <div>2</div>
            <div>3</div>
        </div>
    </div>
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
import PickHelper from "@/utils/helper/PickHelper";
import GPUPickHelper from "@/utils/helper/GPUPickHelper";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {BloomPass} from "three/examples/jsm/postprocessing/BloomPass";
import {FilmPass} from "three/examples/jsm/postprocessing/FilmPass";


// worker.postMessage(0);
// // 监听message事件
// worker.onmessage = (e) => {
//
//     worker.terminate()
// }
function init() {

    const canvas = document.querySelector( '#c' );
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        logarithmicDepthBuffer: true,
    })

    const fov = 60;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 200;
    const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.z = 30;

    const scene = new THREE.Scene();
    /**
     * 添加一个可以通过拖动屏幕控制的
     * target设置为设置拖动时旋转的中心
     * 默认为0， 0， 0
     */
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;

    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);


    const labelContainerElem = document.querySelector('#labels');

    function makeInstance(geometry, color, x, name) {
        const material = new THREE.MeshBasicMaterial({
            color
        })
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x

        let elem = document.createElement('div')
        elem.textContent = name;
        labelContainerElem.appendChild(elem)
        elem.onclick = () => {
            console.log({
                cube,
                elem
            })
        }
        console.log(labelContainerElem)

        return {
            cube,
            elem
        }
    }

    const cubes = [
        makeInstance(boxGeometry, 0x44aa88,  0, 'Aqua'),
        makeInstance(boxGeometry, 0x8844aa, -4, 'Purple'),
        makeInstance(boxGeometry, 0xaa8844,  4, 'Gold')
    ]

    let then = 0
    function render(now) {
        now *= 0.001
        then = now;
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        const tempV = new THREE.Vector3();
        const raycaster = new THREE.Raycaster();
        cubes.forEach((cubeInfo, ndx) => {
            const { cube, elem } = cubeInfo
            const speed = 1 + ndx * .1;
            const rot = now * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;

            //获取立方体中心的位置
            cube.updateWorldMatrix(true, false);
            cube.getWorldPosition(tempV);

            tempV.project(camera)

            raycaster.setFromCamera(tempV, camera)
            const intersectedObjects = raycaster.intersectObjects(scene.children);
            const show = intersectedObjects.length && cube === intersectedObjects[0].object

            if (!show) {
                elem.style.display = 'none';
            } else {
                elem.style.display = '';
            }
            const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
            const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

            // 将元素移动到此位置
            elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
        })
        controls.update();


        renderer.render(scene, camera);

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

<style scoped lang="scss">
#app {
    margin: 0;
    padding: 0;
}
</style>
<style lang="scss">

#c {
    width: 100vw;
    height: 100vh;
}
#container {
    position: relative;  /* 作为子元素的相对定位元素 */
    width: 100%;
    height: 100%;
    overflow: hidden;
}
#labels {
    position: absolute;  /* 把Label定位在容器内 */
    left: 0;             /* 默认定位在左上角 */
    top: 0;
    z-index: 2;
    color: white;
}
.labels {
    div {
        position: absolute;  /* 让我们的容器决定尺寸 */
        left: 0;             /* 默认定位在左上角 */
        top: 0;
        cursor: pointer;     /* 当悬浮时，变为一个小手 */
        font-size: large;
        user-select: none;   /* 不允许文字被选中 */
        text-shadow:         /* 创造一个黑色阴影 */
            -1px -1px 0 #000,
            0   -1px 0 #000,
            1px -1px 0 #000,
            1px  0   0 #000,
            1px  1px 0 #000,
            0    1px 0 #000,
            -1px  1px 0 #000,
            -1px  0   0 #000;
    }
}


#labels>div:hover {
    color: red;
}
</style>