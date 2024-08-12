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
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
//创建
</script>

<style scoped>
</style>
