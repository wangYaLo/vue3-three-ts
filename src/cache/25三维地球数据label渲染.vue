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
import countryJson from '@/assets/json/country.json'
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
    console.log(countryJson)
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
    camera.position.z = 15;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FFFFFF')
    /**
     * 添加一个可以通过拖动屏幕控制的
     * target设置为设置拖动时旋转的中心
     * 默认为0， 0， 0
     */
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;


    const loader = new THREE.TextureLoader();
    const texture = loader.load('/src/assets/image/country-outlines-4k.png', render)
    const geometry = new THREE.SphereGeometry(5, 64, 32);
    const material = new THREE.MeshBasicMaterial({map: texture});
    scene.add(new THREE.Mesh(geometry, material));

    const lonFudge = Math.PI * 1.5;
    const latFudge = Math.PI;
// 这些小工具会使得盒模型定位非常容易
// 我们可以旋转lonHelper Y轴上的分量到经度上
    const lonHelper = new THREE.Object3D();
// 我们可以旋转latHelper X轴上的分量到纬度上
    const latHelper = new THREE.Object3D();
    lonHelper.add(latHelper);
// positionHelper将对象移动到球体的边缘
    const positionHelper = new THREE.Object3D();
    positionHelper.position.z = 5;
    latHelper.add(positionHelper);

    const labelParentElem = document.querySelector('#labels')
    let countryInfos = countryJson
    for (const countryInfo of countryInfos) {
        let { lat, lon, name, min, max } = countryInfo;
        lonHelper.rotation.y = THREE.MathUtils.degToRad(lon) + lonFudge;
        latHelper.rotation.x = THREE.MathUtils.degToRad(lat) + latFudge;
        positionHelper.updateWorldMatrix(true, false);
        const position = new THREE.Vector3();
        positionHelper.getWorldPosition(position);
        countryInfo.position = position;

        const width = max[0] - min[0]
        const height = max[1] - min[1]
        const area = width * height
        countryInfo.area = area;


        const elem = document.createElement('div');
        elem.textContent = name;
        labelParentElem.appendChild(elem);
        countryInfo.elem = elem;
    }

    const tempV = new THREE.Vector3();
    const cameraToPoint = new THREE.Vector3()
    const cameraPosition = new THREE.Vector3()
    const normalMatrix = new THREE.Matrix3()
    const large = 20 * 20;
    function updateLabels() {
        // 如果JSON文件还没加载进来，就退出
        if (!countryInfos) {
            return;
        }

        for (const countryInfo of countryInfos) {
            const {position, elem, area} = countryInfo;

            normalMatrix.getNormalMatrix(camera.matrixWorldInverse);
            camera.getWorldPosition(cameraPosition);

            tempV.copy(position);
            tempV.applyMatrix3(normalMatrix)

            cameraToPoint.copy(position);
            cameraToPoint.applyMatrix4(camera.matrixWorldInverse).normalize()

            if (area < large) {
                elem.style.display = "none";
                continue
            }

            const dot = tempV.dot(cameraToPoint)

            if (dot > 0.2) {
                elem.style.display = "none";
                continue
            }

            elem.style.display = "";

            // 获取标准化屏幕坐标，x和y都会在-1和1区间
            // x = -1 表示在最左侧
            // y = -1 表示在最底部
            tempV.copy(position);
            tempV.project(camera);

            // 将标准屏幕坐标转化为CSS坐标
            const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
            const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

            // 将元素移动到此位置
            elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;

            // 设置排序用的zIndex
            elem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
        }
    }



    let renderRequested = false;
    function render(now) {
        now *= 0.001
        renderRequested = false;
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        controls.update();
        updateLabels()
        renderer.render(scene, camera);

        // requestAnimationFrame(render);
    }

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
    render()
    function requestRenderIfNotRequested() {
        if (!renderRequested) {
            renderRequested = true;
            requestAnimationFrame(render);
        }
    }
    controls.addEventListener('change', requestRenderIfNotRequested)
    window.addEventListener('resize', requestRenderIfNotRequested);




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