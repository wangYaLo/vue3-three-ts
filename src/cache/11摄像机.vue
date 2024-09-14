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
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {color} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import {RectAreaLightUniformsLib} from "three/examples/jsm/lights/RectAreaLightUniformsLib";
import {RectAreaLightHelper} from "three/examples/jsm/helpers/RectAreaLightHelper";

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

    RectAreaLightUniformsLib.init();
    /**
     * 创建摄像机
     * fov - 视野角度
     * aspect - 画布的宽高比
     * near - 近平面
     * far - 远平面
     * 近远平面决定了当距离大于far或者小于near的时候物体都会被裁剪掉
     */
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
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
         * 添加一个可以通过拖动屏幕控制的
         * target设置为设置拖动时旋转的中心
         * 默认为0， 0， 0
         */
        const controls = new OrbitControls(camera, canvas);
        controls.target.set(0, 0, 0)
        controls.update()

        camera.position.y = 10;

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
        light.rotation.x = THREE.MathUtils.degToRad(-90);
        scene.add(light);


        /**
         * 添加一个lil-gui控制灯光
         */
        class ColorGUIHelper {
            private object: any;
            private prop: any;
            constructor(object: any, prop: any) {
                this.object = object;
                this.prop = prop
            }
            get value() {
                return `#${this.object[this.prop].getHexString()}`;
            }
            set value(hexString) {
                this.object[this.prop].set(hexString);
            }
        }

        /**
         * 创建一个以度数为单位的操作对象
         */
        class DegRadHelper {
            private obj: any;
            private prop: any;
            constructor(obj, prop) {
                this.obj = obj;
                this.prop = prop;
            }
            get value() {
                return THREE.MathUtils.radToDeg(this.obj[this.prop]);
            }
            set value(v) {
                this.obj[this.prop] = THREE.MathUtils.degToRad(v);
            }
        }

        class MinMaxGUIHelper {
            private obj: any;
            private minProp: any;
            private maxProp: any;
            private minDif: any;
            constructor(obj, minProp, maxProp, minDif) {
                this.obj = obj;
                this.minProp = minProp;
                this.maxProp = maxProp;
                this.minDif = minDif;
            }
            get min() {
                return this.obj[this.minProp];
            }
            set min(v) {
                this.obj[this.minProp] = v;
                this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
            }
            get max() {
                return this.obj[this.maxProp];
            }
            set max(v) {
                this.obj[this.maxProp] = v;
                this.min = this.min;  // 这将调用min的setter
            }
        }

        // const gui = new GUI();
        // console.log(light)
        // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
        // gui.add(light, 'intensity', 0, 150, 0.01);
        // gui.add(light, 'width', 0, 20);
        // gui.add(light, 'height', 0, 20);
        // gui.add(new DegRadHelper(light.rotation, 'x'), 'value', -180, 180).name('x rotation');
        // gui.add(new DegRadHelper(light.rotation, 'y'), 'value', -180, 180).name('y rotation');
        // gui.add(new DegRadHelper(light.rotation, 'z'), 'value', -180, 180).name('z rotation');

        function updateCamera() {
            camera.updateProjectionMatrix();
        }

        const gui = new GUI();
        gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
        const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
        gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
        gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);



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
        objects.forEach(object => {
            object.rotation.y += 0.01;
            object.rotation.x += 0.01;
        })
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
