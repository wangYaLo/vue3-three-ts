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
import PickHelper from "@/utils/helper/PickHelper";
import GPUPickHelper from "@/utils/helper/GPUPickHelper";


// worker.postMessage(0);
// // 监听message事件
// worker.onmessage = (e) => {
//
//     worker.terminate()
// }
function init() {

    //获取需要渲染的canvas
    const canvas = document.getElementById('c') as HTMLElement
    //创建渲染器
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas
    })
    // 创建摄像机
    const camera = new THREE.PerspectiveCamera(
        60,window.innerWidth / window.innerHeight,
        0.1,
        200
    )

    camera.position.z = 30;

    //创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('white')
    const pickingScene = new THREE.Scene();
    pickingScene.background = new THREE.Color(0)

    // 将摄像机放在自拍杆上面
    const cameraPole = new THREE.Object3D()
    scene.add(cameraPole)
    cameraPole.add(camera)
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    // const light = new THREE.PointLight(color, intensity);
    light.position.set(10, 10, 10);
    //把光源放在摄像机上面
    camera.add(light);

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    function rand(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + (max - min) * Math.random();
    }

    function randomColor() {
        return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
    }

    const idToObject = {}
    const numObjects = 100;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('src/assets/image/frame.png');
    for (let i = 0; i < numObjects; ++i) {
        const id = i + 1
        const material = new THREE.MeshPhongMaterial({
            color: randomColor(),
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.5
        });

        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        idToObject[id] = cube

        cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
        cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
        cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));

        const pickingMaterial = new THREE.MeshPhongMaterial({
            emissive: new THREE.Color().setHex(id, THREE.NoColorSpace),
            color: new THREE.Color(0, 0, 0),
            specular: new THREE.Color(0, 0, 0),
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.5,
            blending: THREE.NoBlending,
        });
        const pickingCube = new THREE.Mesh(geometry, pickingMaterial);
        pickingScene.add(pickingCube);
        pickingCube.position.copy(cube.position);
        pickingCube.rotation.copy(cube.rotation);
        pickingCube.scale.copy(cube.scale);
    }

    const pickPosition = {
        x: 0,
        y: 0,
    }

    clearPickPosition()


    function clearPickPosition() {
        // 对于触屏，不像鼠标总是能有一个位置坐标，
        // 如果用户不在触摸屏幕，我们希望停止拾取操作。
        // 因此，我们选取一个特别的值，表明什么都没选中
        pickPosition.x = -100000;
        pickPosition.y = -100000;
    }

    function setPickPosition(event) {
        const pos = getCanvasRelativePosition(event);
        // pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
        // pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
        pickPosition.x = pos.x;
        pickPosition.y = pos.y;
    }

    function getCanvasRelativePosition(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * canvas.width  / rect.width,
            y: (event.clientY - rect.top ) * canvas.height / rect.height,
        };
    }

    window.addEventListener('mousemove', setPickPosition);
    window.addEventListener('mouseout', clearPickPosition);
    window.addEventListener('mouseleave', clearPickPosition);

    window.addEventListener('touchstart', (event) => {
        // 阻止窗口滚动行为
        event.preventDefault();
        setPickPosition(event.touches[0]);
    }, {passive: false});

    window.addEventListener('touchmove', (event) => {
        setPickPosition(event.touches[0]);
    });

    window.addEventListener('touchend', clearPickPosition);

    const pickHelper = new GPUPickHelper();

    function render(time) {
        time *= 0.001
        cameraPole.rotation.y = time * .1
        pickHelper.pick(pickPosition, pickingScene, camera, time, renderer, idToObject);
        renderer.render(scene, camera);
        // renderer.render(pickingScene, camera);
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        requestAnimationFrame(render)
    }
    requestAnimationFrame(render)

    /**
     * 响应式变化 像素 大小 宽高比
     * @param renderer
     */
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
