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
import {color, texture} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
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
import {MeshPhongMaterial} from "three";

// worker.postMessage(0);
// // 监听message事件
// worker.onmessage = (e) => {
//
//     worker.terminate()
// }
function init() {

    const canvas = document.getElementById('c') as HTMLElement
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        logarithmicDepthBuffer: true
    })
    const fov = 60;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 200;
    const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.y = 5;

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    // const light = new THREE.PointLight(color, intensity);
    light.position.set(10, 10, 10);
    // camera.add(light)

    const orbitControls = new OrbitControls(camera, canvas);
    orbitControls.target.set(0, 0, 0)
    orbitControls.enableDamping = true
    orbitControls.update()




    const scene = new THREE.Scene();

    scene.add(camera)
    scene.add(light)



    //创建一个圆柱体
    const trunkRadius = 0.2;
    const trunkHeight = 1;
    const trunkRadialSegments = 12;
    const trunkGeometry = new THREE.CylinderGeometry(
        trunkRadius,
        trunkRadius,
        trunkHeight,
        trunkRadialSegments
    )

    const topRadius = trunkRadius * 4;
    const topHeight = trunkHeight * 2;
    const topSegments = 12;
    const topGeometry = new THREE.ConeGeometry(
        topRadius, topHeight, topSegments);

    const trunkMaterial = new THREE.MeshPhongMaterial({color: 'brown'});
    const topMaterial = new THREE.MeshPhongMaterial({color: 'green'});

    const cubes = []

    function makTree(x, z) {
        const root = new THREE.Object3D()
        const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
        const trunk = new THREE.Mesh(boxGeometry, trunkMaterial)
        trunk.position.y = trunkHeight / 2;
        root.add(trunk);

        cubes.push(trunk)

        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = (topHeight / 2) + trunkHeight;
        root.add(top);

        root.position.set(x, 0, z);
        scene.add(root);

        return root;
    }

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

        camera.position.copy(boxCenter);
        camera.position.z += distance;

        camera.near = boxSize / 100;
        camera.far = boxSize * 100;

        camera.updateProjectionMatrix();
    }

    function makeSpriteTexture(textureSize, obj) {
        const rt = new THREE.WebGLRenderTarget(textureSize, textureSize);

        const aspect = 1;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

        scene.add(obj);

        const box = new THREE.Box3().setFromObject(obj);

        const boxSize = box.getSize(new THREE.Vector3())
        const boxCenter = box.getCenter(new THREE.Vector3());

        const fudge = 1.1
        const size = Math.max(...boxSize.toArray()) * fudge
        frameArea(size, size, boxCenter, camera);
        renderer.autoClear = false;
        renderer.setRenderTarget(rt);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        // renderer.autoClear = true;

        scene.remove(obj);
        console.log({
            position: boxCenter.multiplyScalar(fudge),
            scale: size,
            texture: rt.texture,
        })
        return {
            position: boxCenter.multiplyScalar(fudge),
            scale: size,
            texture: rt.texture,
        };


    }

    function makeSprite(spriteInfo, x, z) {
        const {texture, position, scale} = spriteInfo;
        const mat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });
        const sprite = new THREE.Sprite(mat);
        scene.add(sprite);
        sprite.position.set(
            position.x + x,
            position.y,
            position.z + z);
        sprite.scale.set(scale, scale, scale);
    }

    // 创建Billboard纹理
    const tree = makTree(0, 0);
    const facadeSize = 64;
    const treeSpriteInfo = makeSpriteTexture(facadeSize, tree);

    console.log(treeSpriteInfo)

    // for (let z = -50; z <= 100; z += 10) {
    //     for (let x = -50; x <= 100; x += 10) {
    //
    //     }
    // }
    makeSprite(treeSpriteInfo, 0, 0);

    const size = 400;
    const planeGeometry = new THREE.PlaneGeometry(size, size);
    const meshPhongMaterial = new MeshPhongMaterial({
        color: 'gray'
    });
    const mesh = new THREE.Mesh(planeGeometry, meshPhongMaterial);
    mesh.rotation.x = Math.PI / -2;
    scene.add(mesh)



    function render(time) {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera)
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
