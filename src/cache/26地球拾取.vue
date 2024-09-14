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
import countryInfos from '@/assets/json/country.json'

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

    camera.position.z = 3;

    //创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('white')

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0)
    controls.enableDamping = true;

    const pickingScene = new THREE.Scene();
    pickingScene.background = new THREE.Color(0)

    // 将摄像机放在自拍杆上面
    scene.add(camera)
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    // const light = new THREE.PointLight(color, intensity);
    light.position.set(10, 10, 10);
    //把光源放在摄像机上面
    camera.add(light);
    const pickHelper = new GPUPickHelper();

    const idToObject = {}

    const loader = new THREE.TextureLoader();
    const geometry = new THREE.SphereGeometry(1, 64, 32);

    const indexTexture = loader.load('src/assets/image/country-index-texture.png', render);
    indexTexture.minFilter = THREE.NearestFilter;
    indexTexture.magFilter = THREE.NearestFilter;
    const pickingMaterial = new THREE.MeshBasicMaterial({map: indexTexture});
    pickingScene.add(new THREE.Mesh(geometry, pickingMaterial));

    const fragmentShaderReplacements = [
        {
            from: '#include <common>',
            to: `
        #include <common>
        uniform sampler2D indexTexture;
        uniform sampler2D paletteTexture;
        uniform float paletteTextureWidth;
      `,
        },
        {
            from: '#include <color_fragment>',
            to: `
        #include <color_fragment>
        {
          vec4 indexColor = texture2D(indexTexture, vMapUv);
          float index = indexColor.r * 255.0 + indexColor.g * 255.0 * 256.0;
          vec2 paletteUV = vec2((index + 0.5) / paletteTextureWidth, 0.5);
          vec4 paletteColor = texture2D(paletteTexture, paletteUV);
          // diffuseColor.rgb += paletteColor.rgb;   // 白轮廓
          diffuseColor.rgb = paletteColor.rgb - diffuseColor.rgb;  // 黑轮廓
        }
      `,
        },
    ];

    const texture = loader.load('src/assets/image/country-outlines-4k.png', render);
    const material = new THREE.MeshBasicMaterial({map: texture});

    const tempColor = new THREE.Color();
    function get255BasedColor(color) {
        tempColor.set(color);
        const base = tempColor.toArray().map(v => v * 255);
        base.push(255); // alpha
        return base;
    }
    const maxNumCountries = 512;
    const paletteTextureWidth = maxNumCountries;
    const paletteTextureHeight = 1;
    const palette = new Uint8Array(paletteTextureWidth * 4);
    const paletteTexture = new THREE.DataTexture(
        palette, paletteTextureWidth, paletteTextureHeight);
    paletteTexture.minFilter = THREE.NearestFilter;
    paletteTexture.magFilter = THREE.NearestFilter;
    for (let i = 1; i < palette.length; ++i) {
        palette[i] = Math.random() * 256;
    }
// 设置海洋颜色 (索引 #0)
    palette.set([100, 200, 255, 255], 0);
    paletteTexture.needsUpdate = true;
    material.onBeforeCompile = function(shader) {
        fragmentShaderReplacements.forEach((rep) => {
            console.log(rep.from)
            console.log(rep.to)
            shader.fragmentShader = shader.fragmentShader.replace(rep.from, rep.to);
        });
        shader.uniforms.paletteTexture = {value: paletteTexture};
        shader.uniforms.indexTexture = {value: indexTexture};
        shader.uniforms.paletteTextureWidth = {value: paletteTextureWidth};
    };

    const selectedColor = get255BasedColor('red');
    const unselectedColor = get255BasedColor('#444');
    const oceanColor = get255BasedColor('rgb(100,200,255)');
    resetPalette();

    function setPaletteColor(index, color) {
        palette.set(color, index * 4);
    }

    function resetPalette() {
        // 让所有的颜色都是未选择状态的颜色
        for (let i = 1; i < maxNumCountries; ++i) {
            setPaletteColor(i, unselectedColor);
        }

        // 设置海洋颜色 (索引 #0)
        setPaletteColor(0, oceanColor);
        paletteTexture.needsUpdate = true;
    }

    scene.add(new THREE.Mesh(geometry, material));




    const lonFudge = Math.PI * 1.5;
    const latFudge = Math.PI;
    const tempV = new THREE.Vector3();
    // 我们可以旋转lonHelper Y轴上的分量到经度上
    const lonHelper = new THREE.Object3D();
    // 我们可以旋转latHelper X轴上的分量到纬度上
    const latHelper = new THREE.Object3D();
    lonHelper.add(latHelper);
    const positionHelper = new THREE.Object3D();
    positionHelper.position.z = 5;
    latHelper.add(positionHelper);
    for (const countryInfo of countryInfos) {
        let { lat, lon, name, min, max } = countryInfo;
        lonHelper.rotation.y = THREE.MathUtils.degToRad(lon) + lonFudge;
        latHelper.rotation.x = THREE.MathUtils.degToRad(lat) + latFudge;
        positionHelper.updateWorldMatrix(true, false);
        const position = new THREE.Vector3();
        positionHelper.getWorldPosition(position);
        countryInfo.position = position;
        tempV.copy(position);
        tempV.project(camera);
        countryInfo.selected = false

    }


    // for (let i = 0; i < numObjects; ++i) {
    //     const id = i + 1
    //     const material = new THREE.MeshPhongMaterial({
    //         color: GPUPickHelper.randomColor(),
    //         map: texture,
    //         transparent: true,
    //         side: THREE.DoubleSide,
    //         alphaTest: 0.5
    //     });
    //
    //     const cube = new THREE.Mesh(geometry, material);
    //     scene.add(cube);
    //     idToObject[id] = cube
    //     let { rand } = GPUPickHelper
    //     cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
    //     cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
    //     cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));
    //
    //     const pickingMaterial = new THREE.MeshPhongMaterial({
    //         emissive: new THREE.Color().setHex(id, THREE.NoColorSpace),
    //         color: new THREE.Color(0, 0, 0),
    //         specular: new THREE.Color(0, 0, 0),
    //         map: texture,
    //         transparent: true,
    //         side: THREE.DoubleSide,
    //         alphaTest: 0.5,
    //         blending: THREE.NoBlending,
    //     });
    //     const pickingCube = new THREE.Mesh(geometry, pickingMaterial);
    //     pickingScene.add(pickingCube);
    //     pickingCube.position.copy(cube.position);
    //     pickingCube.rotation.copy(cube.rotation);
    //     pickingCube.scale.copy(cube.scale);
    // }

    pickHelper.clearPickPosition()



    let id = 0
    let renderRequested = false
    function render(time) {
        time *= 0.001
        renderRequested = false;
        // id = pickHelper.pick(pickingScene, camera, time, renderer, idToObject);
        controls.update()
        renderer.render(scene, camera);
        // renderer.render(pickingScene, camera);
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
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


    window.addEventListener('mousemove', (event) => {
        pickHelper.setPickPosition(event, canvas)
    });
    window.addEventListener('mouseout', pickHelper.clearPickPosition.bind(pickHelper));
    window.addEventListener('mouseleave', pickHelper.clearPickPosition.bind(pickHelper));

    window.addEventListener('touchstart', (event) => {
        // 阻止窗口滚动行为
        event.preventDefault();
        pickHelper.setPickPosition(event.touches[0], canvas);
    }, {passive: false});

    window.addEventListener('touchmove', (event) => {
        pickHelper.setPickPosition(event.touches[0], canvas);
    });

    // window.addEventListener('touchend', pickHelper.clearPickPosition.bind(pickHelper));

    function requestRenderIfNotRequested() {
        if (!renderRequested) {
            renderRequested = true;
            requestAnimationFrame(render);
        }
    }
    controls.addEventListener('change', requestRenderIfNotRequested)
    window.addEventListener('resize', requestRenderIfNotRequested);
    let numCountriesSelected = 0
    function pickCountry(event) {
        if (!countryInfos) {
            return;
        }

        const position = pickHelper.getCanvasRelativePosition(event, canvas);
        const id = pickHelper.pickSelect(position, pickingScene, camera, renderer);
        console.log(id)
        if (id > 0) {
            const countryInfo = countryInfos[id - 1]
            const selected = !countryInfo.selected;
            if (selected && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
                unselectAllCountries();
            }
            numCountriesSelected += selected ? 1 : -1;
            countryInfo.selected = selected;
            setPaletteColor(id, selected ? selectedColor : unselectedColor);
            paletteTexture.needsUpdate = true;
            requestAnimationFrame(render)
        }
    }
    function unselectAllCountries() {
        numCountriesSelected = 0;
        countryInfos.forEach((countryInfo) => {
            countryInfo.selected = false;
        });
        resetPalette();
    }

    window.addEventListener('pointerup', pickCountry);

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
