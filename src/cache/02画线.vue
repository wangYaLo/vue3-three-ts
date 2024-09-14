<template>
  <div>
    
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
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500)
//创建一个渲染器
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
camera.position.set(0, 0, 100)
camera.lookAt(0, 0, 0)

/**
 * 定义一个材质
 * 创建一个蓝色的线条材质
 */
const material = new THREE.LineBasicMaterial({
  color: 0x0000ff
})
const points = []
points.push(new THREE.Vector3(-10, 0, 0))
points.push(new THREE.Vector3(0, 10, 0))
points.push(new THREE.Vector3(10, 0, 0))

const geometry = new THREE.BufferGeometry().setFromPoints(points)
const line = new THREE.Line(geometry, material)

scene.add(line)
function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}
animate();
</script>

<style scoped>
</style>
