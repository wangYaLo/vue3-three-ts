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
    /**
     * 设置光能投影
     */
    renderer.shadowMap.enabled = true;

    RectAreaLightUniformsLib.init();
    /**
     * 创建摄像机
     * fov - 视野角度
     * aspect - 画布的宽高比
     * near - 近平面
     * far - 远平面
     * 近远平面决定了当距离大于far或者小于near的时候物体都会被裁剪掉
     */
    const camera = new THREE.PerspectiveCamera(60,  // fov
        window.innerWidth / window.innerHeight,   // aspect
        0.1, // near
        60,);

    camera.position.z = 10;
    camera.position.y = 10;

    /**
     * 创建一个场景
     */
    const scene = new THREE.Scene()

    const objects = [];

    // const cameraHelper = new THREE.CameraHelper(camera);
    //
    // scene.add(cameraHelper)


    /**
     * 添加一个可以通过拖动屏幕控制的
     * target设置为设置拖动时旋转的中心
     * 默认为0， 0， 0
     */
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0)
    controls.update()


    /**
     * 创建模型
     */
    function createMesh() {

        function makeSpherePositions(segmentsAround, segmentsDown) {
            const numVertices = segmentsAround * segmentsDown * 6;
            const numComponents = 3;
            const positions = new Float32Array(numVertices * numComponents);
            const indices = [];
            const longHelper = new THREE.Object3D();
            const latHelper = new THREE.Object3D();
            const pointHelper = new THREE.Object3D();
            longHelper.add(latHelper);
            latHelper.add(pointHelper);
            pointHelper.position.z = 1;
            const temp = new THREE.Vector3();

            function getPoint(lat, long) {
                latHelper.rotation.x = lat;
                longHelper.rotation.y = long;
                longHelper.updateMatrixWorld(true);
                console.log(pointHelper.getWorldPosition(temp).toArray())
                return pointHelper.getWorldPosition(temp).toArray();
            }
            let posNdx = 0;
            let ndx = 0;
            for (let down = 0; down < segmentsDown; ++down) {
                const v0 = down / segmentsDown;
                const v1 = (down + 1) / segmentsDown;
                const lat0 = (v0 - 0.5) * Math.PI;
                const lat1 = (v1 - 0.5) * Math.PI;

                for (let across = 0; across < segmentsAround; ++across) {
                    const u0 = across / segmentsAround;
                    const u1 = (across + 1) / segmentsAround;
                    const long0 = u0 * Math.PI * 2;
                    const long1 = u1 * Math.PI * 2;

                    positions.set(getPoint(lat0, long0), posNdx);  posNdx += numComponents;
                    positions.set(getPoint(lat1, long0), posNdx);  posNdx += numComponents;
                    positions.set(getPoint(lat0, long1), posNdx);  posNdx += numComponents;
                    positions.set(getPoint(lat1, long1), posNdx);  posNdx += numComponents;

                    indices.push(
                        ndx, ndx + 1, ndx + 2,
                        ndx + 2, ndx + 1, ndx + 3,
                    );
                    ndx += 4;
                }
            }
            return {positions, indices};

        }

        const segmentsAround = 24;
        const segmentsDown = 16;
        const {positions, indices} = makeSpherePositions(segmentsAround, segmentsDown);

        const normals = positions.slice();
        const geometry = new THREE.BufferGeometry();
        const positionNumComponents = 3;
        const normalNumComponents = 3;

        const positionAttribute = new THREE.BufferAttribute(positions, positionNumComponents);
        positionAttribute.setUsage(THREE.DynamicDrawUsage);
        geometry.setAttribute(
            'position',
            positionAttribute);
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(normals, normalNumComponents));
        geometry.setIndex(indices);

        const meshBasicMaterial = new THREE.MeshBasicMaterial({
            color: 'red'
        });
        const mesh = new THREE.Mesh(geometry, meshBasicMaterial);
        scene.add(mesh);




        return (time) => {
            time *= 0.01;

            if (resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }

            const temp = new THREE.Vector3();


            for (let i = 0; i < positions.length; i += 3) {
                const quad = (i / 12 | 0);
                const ringId = quad / segmentsAround | 0;
                const ringQuadId = quad % segmentsAround;
                const ringU = ringQuadId / segmentsAround;
                const angle = ringU * Math.PI * 2;
                temp.fromArray(normals, i);
                temp.multiplyScalar(THREE.MathUtils.lerp(1, 1.4, Math.sin(time + ringId + angle) * .5 + .5));
                temp.toArray(positions, i);
            }
            positionAttribute.needsUpdate = true;
        }



    }

    let func = createMesh()

    let time = 0
    /**
     * 渲染的时候需要执行的回调函数
     */
    function callback() {
        /**
         * 剪刀函数，开启两个区域渲染必须要开启
         */

        time++

        func(time)


        renderer.render(scene, camera);


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
