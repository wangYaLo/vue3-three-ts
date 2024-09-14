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
import {color} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
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
        const texture = loader.load('src/assets/image/Snipaste_2023-02-27_10-27-38.png')
        texture.colorSpace = THREE.SRGBColorSpace

        const material = new THREE.MeshBasicMaterial({
            map: texture
        })

        const box = new THREE.BoxGeometry(8, 8, 8)

        const mesh = new THREE.Mesh(box, material)

        // scene.add(mesh)
        // objects.push(mesh);

        /**
         * 创建一个6个面都是不同图片纹理的方块
         */

        function loadColorTexture(path: string) {
            const texture = loader.load(path);
            texture.colorSpace = THREE.SRGBColorSpace
            return texture
        }

        const materials = [
            new THREE.MeshBasicMaterial({ map: loadColorTexture('src/assets/image/tai.jpg')}),
            new THREE.MeshBasicMaterial({ map: loadColorTexture('src/assets/image/tai01.png')}),
            new THREE.MeshBasicMaterial({ map: loadColorTexture('src/assets/image/tai02.png')}),
            new THREE.MeshBasicMaterial({ map: loadColorTexture('src/assets/image/tai03.jpg')}),
            new THREE.MeshBasicMaterial({ map: loadColorTexture('src/assets/image/tai04.jpg')}),
            new THREE.MeshBasicMaterial({ map: loadColorTexture('src/assets/image/Snipaste_2023-02-27_10-27-38.png')})
        ]

        const cube = new THREE.Mesh(box, materials)
        cube.position.set(10, 10, 0)
        // scene.add(cube)
        // objects.push(cube);

        /**
         * 等待一个纹理加载
         */
        const loader1 = new THREE.TextureLoader()
        loader1.load('src/assets/image/tai.jpg', (texture) => {
            const material = new THREE.MeshBasicMaterial({
                map: texture,
            });
            const cube1 = new THREE.Mesh(box, material);
            cube1.position.set(20, 10, 0)
            // scene.add(cube1);
            // objects.push(cube1);
        })

        /**
         * 等待多个纹理
         */
        const loadManager = new THREE.LoadingManager()
        const loader3 = new THREE.TextureLoader(loadManager)

        function loadColorTexture3(path: string) {
            const texture = loader3.load(path);
            texture.colorSpace = THREE.SRGBColorSpace
            texture.minFilter = THREE.NearestMipmapNearestFilter
            return texture
        }

        const materials3 = [
            new THREE.MeshBasicMaterial({ map: loadColorTexture3('src/assets/image/tai.jpg')}),
            new THREE.MeshBasicMaterial({ map: loadColorTexture3('src/assets/image/tai01.png')}),
            new THREE.MeshBasicMaterial({ map: loadColorTexture3('src/assets/image/tai02.png')}),
            new THREE.MeshBasicMaterial({ map: loadColorTexture3('src/assets/image/tai03.jpg')}),
            new THREE.MeshBasicMaterial({ map: loadColorTexture3('src/assets/image/tai04.jpg')}),
            new THREE.MeshBasicMaterial({ map: loadColorTexture3('src/assets/image/Snipaste_2023-02-27_10-27-38.png')})
        ]

        loadManager.onLoad = () => {
            const cube3 = new THREE.Mesh(box, materials3)
            cube3.position.set(10, 20, 0)
            // scene.add(cube3)
            // objects.push(cube3)
        }
        /**
         * 多个加载提供进度条功能
         * @param urlOfLastItemLoaded
         * @param itemsLoaded
         * @param itemsTotal
         */
        loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
            console.log(urlOfLastItemLoaded)
            const progress = itemsLoaded / itemsTotal;
            console.log(progress)
        };


        const loader4 = new THREE.TextureLoader()
        const texture4 = loader4.load('src/assets/image/mip-low-res-enlarged.png');
        texture.colorSpace = THREE.SRGBColorSpace
        texture4.minFilter = THREE.LinearFilter
        const box4 = new THREE.BoxGeometry(500, 500, 500)
        const material4 = new THREE.MeshBasicMaterial({
            map: texture4
        })
        const cube4 = new THREE.Mesh(box4, material4)

        scene.add(cube4)
        objects.push(cube4)
        camera.position.z = 1000;





    }

    createMesh()


    /**
     * 渲染的时候需要执行的回调函数
     */
    function callback() {
        objects.forEach(object => {
            // object.rotation.y += 0.01;
            // object.rotation.x += 0.01;
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
