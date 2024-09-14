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
        500,);

    camera.position.z = 50;
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
        const loader = new THREE.TextureLoader()
        const texture = loader.load('src/assets/image/checker.png')
        texture.wrapT = THREE.RepeatWrapping
        texture.wrapS = THREE.RepeatWrapping
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        const planeSize = 40;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        /**
         * 创建一个平面几何体
         */
        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize)
        const planeMat = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        planeMat.color.setRGB(1.5, 1.5, 1.5)
        const planeCube = new THREE.Mesh(planeGeo, planeMat)
        planeCube.receiveShadow = true
        planeCube.rotation.x = Math.PI * -.5;
        scene.add(planeCube);

        scene.background = new THREE.Color(0xFFFFFF)

        /**
         * 加载阴影贴图
         */
        const shadowTexture = loader.load('src/assets/image/roundshadow.png')

        const sphereShadowBases = []

        /**
         * 创建一个球体
         */
        const sphereRadius = 1;
        const sphereWidthDivisions = 32
        const sphereHeightDivisions = 16
        const sphereGeo = new THREE.SphereGeometry(
            sphereRadius,
            sphereWidthDivisions,
            sphereHeightDivisions
        );

        const meshPhongMaterial = new THREE.MeshPhongMaterial();

        const mesh = new THREE.Mesh(sphereGeo, meshPhongMaterial);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.y = 2
        scene.add(mesh);
        const boxSize = 8
        const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
        const meshPhongMaterial1 = new THREE.MeshPhongMaterial();

        const mesh1 = new THREE.Mesh(boxGeometry, meshPhongMaterial1);
        mesh1.castShadow = true;
        mesh1.receiveShadow = true;
        mesh1.position.set(-2, 1, 4)

        scene.add(mesh1);

        const cubeSize = 30;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshPhongMaterial({
            color: "#CCC",
            side: THREE.BackSide,
        });
        const mesh2 = new THREE.Mesh(cubeGeo, cubeMat);
        mesh2.receiveShadow = true;
        mesh2.position.set(0, cubeSize / 2 - 0.1, 0);
        scene.add(mesh2);



        const paneSiz = 1
        const shadowGeo = new THREE.PlaneGeometry(paneSiz, paneSiz)


        const numSpheres = 15;
        // for (let i = 0; i < numSpheres; ++i) {
        //     // make a base for the shadow and the sphere
        //     // so they move together.
        //     const base = new THREE.Object3D();
        //     scene.add(base);
        //
        //     // add the shadow to the base
        //     // note: we make a new material for each sphere
        //     // so we can set that sphere's material transparency
        //     // separately.
        //     const shadowMat = new THREE.MeshBasicMaterial({
        //         map: shadowTexture,
        //         transparent: true, // so we can see the ground
        //         depthWrite: false, // so we don't have to sort
        //     });
        //     const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        //     shadowMesh.position.y = 0.001; // so we're above the ground slightly
        //     shadowMesh.rotation.x = Math.PI * -0.5;
        //     const shadowSize = sphereRadius * 4;
        //     shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
        //     base.add(shadowMesh);
        //
        //     // add the sphere to the base
        //     const u = i / numSpheres; // goes from 0 to 1 as we iterate the spheres.
        //     const sphereMat = new THREE.MeshPhongMaterial();
        //     sphereMat.color.setHSL(u, 1, 0.75);
        //     const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        //     sphereMesh.position.set(0, sphereRadius + 2, 0);
        //     base.add(sphereMesh);
        //
        //     // remember all 3 plus the y position
        //     sphereShadowBases.push({
        //         base,
        //         sphereMesh,
        //         shadowMesh,
        //         y: sphereMesh.position.y,
        //     });
        // }

        // const skyColor = 0xb1e1ff; // light blue
        // const groundColor = 0xb97a20; // brownish orange
        // const intensity = 2;
        // const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        // scene.add(light);

        const color = 0xffffff;
        const intensity1 = 4;
        const light1 = new THREE.DirectionalLight(color, intensity1);
        light1.position.set(0, 10, 5);
        light1.target.position.set(-5, 0, 0);
        light1.castShadow = true;
        light1.shadow.mapSize.width = 50
        light1.shadow.mapSize.height = 50
        scene.add(light1);
        scene.add(light1.target);

        const cameraHelper = new THREE.CameraHelper(light1.shadow.camera);
        scene.add(cameraHelper);



        const gui = new GUI()
        gui.addColor(new ColorGUIHelper(light1, 'color'), 'value').name('color')
        gui.add(light1, 'intensity', 0, 4, 0.01);
        const folder = gui.addFolder('Shadow Camera');
        folder.open();
        folder.add(new DimensionGUIHelper(light1.shadow.camera, 'left', 'right'), 'value', 1, 100)
            .name('width')
            .onChange(updateCamera);
        folder.add(new DimensionGUIHelper(light1.shadow.camera, 'bottom', 'top'), 'value', 1, 100)
            .name('height')
            .onChange(updateCamera);
        const minMaxGUIHelper = new MinMaxGUIHelper(light1.shadow.camera, 'near', 'far', 0.1);
        folder.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
        folder.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
        folder.add(light1.shadow.camera, 'zoom', 0.01, 1.5, 0.01).onChange(updateCamera);

        function updateCamera() {
            // update the light target's matrixWorld because it's needed by the helper
            light1.target.updateMatrixWorld();
            // update the light's shadow camera's projection matrix
            light1.shadow.camera.updateProjectionMatrix();
            // and now update the camera helper we're using to show the light's shadow camera
            cameraHelper.update();
        }


        return (time) => {
            // time *= 0.01
            // sphereShadowBases.forEach((sphereShadowBase, ndx) => {
            //     const {base, sphereMesh, shadowMesh, y} = sphereShadowBase;
            //
            //     // u is a value that goes from 0 to 1 as we iterate the spheres
            //     const u = ndx / sphereShadowBases.length;
            //
            //     // compute a position for the base. This will move
            //     // both the sphere and its shadow
            //     const speed = time * .2;
            //     const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1);
            //     const radius = Math.sin(speed - ndx) * 10;
            //     base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
            //
            //     // yOff is a value that goes from 0 to 1
            //     const yOff = Math.abs(Math.sin(time * 2 + ndx));
            //     // move the sphere up and down
            //     sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff);
            //     // fade the shadow as the sphere goes up
            //     shadowMesh.material.opacity = THREE.MathUtils.lerp(1, .25, yOff);
            // });
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
        resizeRendererToDisplaySize(renderer);
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
