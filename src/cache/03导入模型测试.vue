<template>
  <div>
    <div id="info">Description</div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
//创建一个场景
const scene = new THREE.Scene()
/**
 * 创建摄像机
 * fov 视野角度
 */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
//创建一个渲染器
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

camera.position.set(0, 0, 10)
camera.lookAt(0, 0, 0)
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

const loader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('src/gltf/')
loader.setDRACOLoader(dracoLoader)
let func: () => void = () => {}
loader.load('src/GLB/Button.glb', function (gltf) {
  console.log(gltf)
  gltf.scene.scale.set(10, 10, 10)
  scene.add(gltf.scene)
  func = () => {
    gltf.scene.rotation.x += 0.01;
    gltf.scene.rotation.y += 0.01;
  }
  animate();
  addLight()
}, undefined, function (error) {
  console.log(error)
})

function addLight() {
  const lightPos = [
    [0, 0, 10],
    [0, 0, -10],
    [0, 10, 0],
    [0, -10, 0],
    [-10, 0, 0],
    [10, 0, 0],
    [5, 10, 0, 0.3],
    [-5, 10, 0, 0.3],
    [0, 10, 5, 0.3],
    [0, 10, -5, 0.3],
  ]
  for (let [x, y, z, intensity] of lightPos) {
    intensity == undefined ? 1 : intensity
    const light = new THREE.DirectionalLight(0xffffff, intensity)
    light.position.set(x, y, z)
    scene.add(light)
  }
}

function animate() {
  requestAnimationFrame( animate );
  func()
  renderer.render( scene, camera );
}
</script>

<style scoped>
#info {
  position: absolute;
  top: 10px;
  width: 100%;
  text-align: center;
  z-index: 100;
  display:block;
  color: #ffffff;
}
</style>
