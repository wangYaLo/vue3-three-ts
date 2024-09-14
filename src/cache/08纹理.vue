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
        const texture = loader.load('src/assets/image/tai.jpg')
        texture.colorSpace = THREE.SRGBColorSpace
        const material = new THREE.MeshBasicMaterial({
            map: texture
        })
        const box = new THREE.BoxGeometry(8, 8, 8)
        const cube = new THREE.Mesh(box, material)
        scene.add(cube);
        objects.push(cube)

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

        class StringToNumberHelper {
            private obj: any;
            private prop: any;
            constructor(obj, prop) {
                this.obj = obj;
                this.prop = prop;
            }
            get value() {
                return this.obj[this.prop];
            }
            set value(v) {
                this.obj[this.prop] = parseFloat(v);
            }
        }

        const wrapModes = {
            'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
            'RepeatWrapping': THREE.RepeatWrapping,
            'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
        };

        function updateTexture() {
            texture.needsUpdate = true;
        }

        const gui = new GUI();
        gui.add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes)
            .name('texture.wrapS')
            .onChange(updateTexture);
        gui.add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes)
            .name('texture.wrapT')
            .onChange(updateTexture);
        gui.add(texture.repeat, 'x', 0, 5, .01).name('texture.repeat.x');
        gui.add(texture.repeat, 'y', 0, 5, .01).name('texture.repeat.y');
        gui.add(texture.offset, 'x', -2, 2, .01).name('texture.offset.x');
        gui.add(texture.offset, 'y', -2, 2, .01).name('texture.offset.y');
        gui.add(texture.center, 'x', -.5, 1.5, .01).name('texture.center.x');
        gui.add(texture.center, 'y', -.5, 1.5, .01).name('texture.center.y');
        gui.add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360)
            .name('texture.rotation');


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
