<template>
    <canvas id="c">
    </canvas>
    <div class="split">
        <div id="view1" tabindex="1"></div>
        <div id="view2" tabindex="2"></div>
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

function init() {

    const canvas = document.getElementById('c') as HTMLElement
    /**
     * 创建一个渲染器
     * 可以将自己创建侧canvas这个DOM传入参数作为渲染的容器
     * 如果不传入canvas Three会自己创建一个dom
     */
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        logarithmicDepthBuffer: true,
    })

    RectAreaLightUniformsLib.init();
    /**
     * 创建摄像机
     * fov - 视野角度
     * aspect - 画布的宽高比
     * near - 近平面
     * far - 远平面
     * 近远平面决定了当距离大于far或者小于near的时候物体都会被裁剪掉
     */
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.00001, 3000)
    camera.position.z = 50;

    const camera2 = new THREE.PerspectiveCamera(
        60,  // fov
        2,   // aspect
        0.1, // near
        500, // far
    );
    camera2.position.set(40, 10, 30);
    camera2.lookAt(0, 5, 0);

    /**
     * 创建一个场景
     */
    const scene = new THREE.Scene()

    const objects = [];

    const cameraHelper = new THREE.CameraHelper(camera);

    scene.add(cameraHelper)

    const view1Elem = document.querySelector('#view1');
    const view2Elem = document.querySelector('#view2');

    console.log(view1Elem)


    const controls2 = new OrbitControls(camera2, view2Elem);
    controls2.target.set(0, 5, 0);
    controls2.update();


    /**
     * 添加一个可以通过拖动屏幕控制的
     * target设置为设置拖动时旋转的中心
     * 默认为0， 0， 0
     */
    const controls = new OrbitControls(camera, view1Elem);
    controls.target.set(0, 0, 0)
    controls.update()

    camera.position.y = 10;


    function setScissorForElement(elem) {
        const canvasRect = canvas.getBoundingClientRect();
        const elemRect = elem.getBoundingClientRect();

        // 计算canvas的尺寸
        const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
        const left = Math.max(0, elemRect.left - canvasRect.left);
        const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
        const top = Math.max(0, elemRect.top - canvasRect.top);

        const width = Math.min(canvasRect.width, right - left);
        const height = Math.min(canvasRect.height, bottom - top);

        // 设置剪函数以仅渲染一部分场景
        const positiveYUpBottom = canvasRect.height - bottom;
        renderer.setScissor(left, positiveYUpBottom, width, height);
        renderer.setViewport(left, positiveYUpBottom, width, height);

        // 返回aspect
        return width / height;
    }


    /**
     * 创建模型
     */
    function createMesh() {
        const loader = new THREE.TextureLoader()
        const texture = loader.load('src/assets/image/checker.png')
        texture.wrapT = THREE.RepeatWrapping
        texture.wrapS = THREE.RepeatWrapping
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        const planeSize = 40;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);
        const material = new THREE.MeshBasicMaterial({
            map: texture
        })
        const box = new THREE.BoxGeometry(8, 8, 8)
        const cube = new THREE.Mesh(box, material)
        // scene.add(cube);
        // objects.push(cube);

        /**
         * 创建一个平面几何体
         */
        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize)
        const planeMat = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        const planeCube = new THREE.Mesh(planeGeo, planeMat)
        planeCube.rotation.x = Math.PI * -.5;
        scene.add(planeCube);

        const cubeSize = 4;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshStandardMaterial({color: '#8AC'});
        const mesh1 = new THREE.Mesh(cubeGeo, cubeMat);
        mesh1.position.set(cubeSize + 1, cubeSize / 2, 0);
        scene.add(mesh1);

        const sphereRadius = 3;
        const sphereWidthDivisions = 32;
        const sphereHeightDivisions = 16;
        const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
        const sphereMat = new THREE.MeshStandardMaterial({color: '#CA8'});
        const mesh2 = new THREE.Mesh(sphereGeo, sphereMat);
        mesh2.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
        scene.add(mesh2);

        /**
         * 矩阵灯
         */
        const color = 0xFFFFFF;
        const intensity = 5;
        const width = 12;
        const height = 4;
        const light = new THREE.RectAreaLight(color, intensity, width, height);
        light.position.set(0, 10, 0);
        light.rotation.x = THREE.MathUtils.degToRad(-60);
        scene.add(light);
        function createMaterial() {
            const material = new THREE.MeshStandardMaterial({
                side: THREE.DoubleSide,
            });

            const hue = Math.random();
            const saturation = 1;
            const luminance = .5;
            material.color.setHSL(hue, saturation, luminance);

            return material;
        }
        const numSpheres = 20;
        for (let i = 0; i < numSpheres; ++i) {
            const sphereMat = createMaterial()
            const mesh = new THREE.Mesh(sphereGeo, sphereMat);
            mesh.position.set(-sphereRadius - 1, sphereRadius + 2, i * sphereRadius * -2.2);
            scene.add(mesh);
        }

        const gui = new GUI();
        gui.add(camera, 'fov', 1, 180);
        const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
        gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near');
        gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far');


        /**
         * 添加一个光源辅助对象
         */
            // const helper = new THREE.DirectionalLightHelper(light);
        const helper = new RectAreaLightHelper(light);
        scene.add(helper);



    }

    createMesh()


    /**
     * 渲染的时候需要执行的回调函数
     */
    function callback() {
        /**
         * 剪刀函数，开启两个区域渲染必须要开启
         */
        renderer.setScissorTest(true);
        resizeRendererToDisplaySize(renderer);
        {
            const aspect1 = setScissorForElement(view1Elem);

            // 用计算出的aspect修改摄像机参数
            camera.aspect = aspect1;
            camera.updateProjectionMatrix();
            cameraHelper.update();

            // 来原视野中不要绘制cameraHelper
            cameraHelper.visible = false;

            renderer.render(scene, camera);
        }


        {
            const aspect2 = setScissorForElement(view2Elem);

            // 调整aspect
            camera2.aspect = aspect2;
            camera2.updateProjectionMatrix();

            // 在第二台摄像机中绘制cameraHelper
            cameraHelper.visible = true;
            renderer.render(scene, camera2);

        }


    }



    /**
     * 添加光照
     */
    function addLight() {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        // const light = new THREE.PointLight(color, intensity);
        light.position.set(10, 10, 10);
        scene.add(light);
    }
    // addLight()

    /**
     * 渲染
     */
    function animate() {
        // if (resizeRendererToDisplaySize(renderer)) {
        //     const canvas = renderer.domElement;
        //     camera.aspect = canvas.clientWidth / canvas.clientHeight;
        //     camera.updateProjectionMatrix();
        // }
        callback()
        // renderer.render(scene, camera)
        requestAnimationFrame( animate );
    }

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
    /**
     * 渲染整个场景
     */
    animate()
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
</style>
