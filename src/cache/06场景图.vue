<template>
  <canvas id="c"></canvas>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import {onMounted} from "vue";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import AxisGridHelper from "@/utils/AxisGridHelper";
import { GUI } from 'lil-gui'
function init() {

    const canvas = document.getElementById('c') as HTMLElement
    /**
     * 创建一个渲染器
     * 可以将自己创建侧canvas这个DOM传入参数作为渲染的容器
     * 如果不传入canvas Three会自己创建一个dom
     */
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas
    })
    /**
     * 创建摄像机
     * fov - 视野角度
     * aspect - 画布的宽高比
     * near - 近平面
     * far - 远平面
     * 近远平面决定了当距离大于far或者小于near的时候物体都会被裁剪掉
     */
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 50;
    /**
     * 创建一个场景
     */
    const scene = new THREE.Scene()

    const objects = [];
    const spread = 15;

    function addObject(x, y, obj) {
        obj.position.x = x * spread;
        obj.position.y = y * spread;

        scene.add(obj);
        objects.push(obj);
    }

    function createMaterial() {
        const material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
        });

        const hue = Math.random();
        const saturation = 1;
        const luminance = .5;
        material.color.setHSL(hue, saturation, luminance);

        return material;
    }

    function addSolidGeometry(x, y, geometry) {
        const mesh = new THREE.Mesh(geometry, createMaterial());
        addObject(x, y, mesh);
    }

    /**
     * 创建模型
     */
    function createMesh() {
        const solarSystem = new THREE.Object3D();
        scene.add(solarSystem);
        objects.push(solarSystem);
        const color = 0xFFFFFF;
        const intensity = 3;
        // const light = new THREE.DirectionalLight(color, intensity);
        const light = new THREE.PointLight(color, intensity);
        light.position.set(10, 10, 10);
        scene.add(light);
        /**
         * 一球多用
         * 后面用于创建太阳地球月亮 大小用scale区分
         */
        const radius = 1;
        const widthSegments = 6;
        const heightSegments = 6;
        const sphereGeometry = new THREE.SphereGeometry(
            radius,
            widthSegments,
            heightSegments
        );
        const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
        const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
        sunMesh.scale.set(5, 5, 5); // 扩大太阳的大小
        solarSystem.add(sunMesh);
        objects.push(sunMesh);
        /**
         * 将摄像机放在原点的正上方向
         */
        camera.position.set(0, 20, 0);
        camera.up.set(0, 0, 1);
        camera.lookAt(0, 0, 0);

        /**
         * 创建一个地球
         */
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x2233ff,
            emissive: 0x112244
        })

        const earthOrbit = new THREE.Object3D();
        earthOrbit.position.x = 10;
        solarSystem.add(earthOrbit);
        objects.push(earthOrbit);
        //地球的网格对象
        const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
        //将地球网格对象添加到太阳的网格对象里面
        earthOrbit.add(earthMesh);
        objects.push(earthMesh);

        const moonOrbit = new THREE.Object3D();
        moonOrbit.position.x = 2;
        earthOrbit.add(moonOrbit);
        objects.push(moonOrbit);
        const moonMaterial = new THREE.MeshPhongMaterial({color: 0x888888, emissive: 0x222222});
        const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
        moonMesh.scale.set(.5, .5, .5);
        moonOrbit.add(moonMesh);
        objects.push(moonMesh);
        const gui = new GUI();
        function makeAxisGrid(node: any, label: any, units?: any) {
            const helper = new AxisGridHelper(node, units);
            gui.add(helper, 'visible').name(label);
        }

        makeAxisGrid(solarSystem, 'solarSystem', 25);
        makeAxisGrid(sunMesh, 'sunMesh');
        makeAxisGrid(earthOrbit, 'earthOrbit');
        makeAxisGrid(earthMesh, 'earthMesh');
        makeAxisGrid(moonOrbit, 'moonOrbit');
        makeAxisGrid(moonMesh, 'moonMesh');

    }

    createMesh()


    /**
     * 渲染的时候需要执行的回调函数
     */
    function callback() {
        objects.forEach(object => {
            object.rotation.y += 0.01;
        })
    }



    /**
     * 添加光照
     */
    function addLight() {
        const color = 0xFFFFFF;
        const intensity = 3;
        // const light = new THREE.DirectionalLight(color, intensity);
        const light = new THREE.PointLight(color, intensity);
        // light.position.set(10, 10, 10);
        scene.add(light);
    }
    // addLight()

    /**
     * 渲染
     */
    function animate() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        callback()
        renderer.render(scene, camera)
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
</style>
