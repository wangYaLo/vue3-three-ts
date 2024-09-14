<template>
  <canvas id="c"></canvas>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import {onMounted} from "vue";

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
    camera.position.z = 20;
    /**
     * 创建一个场景
     */
    const scene = new THREE.Scene()
    /**
     * 创建一个包含盒子信息的立体几何体
     */
    const geometry = new THREE.BoxGeometry( 10, 10, 10 );
    /**
     * 创建一个材质并且设置颜色
     */
    // const material = new THREE.MeshBasicMaterial({
    //     color: 0x44aa88,
    // }) //这种材质不会被光线影响
    const material = new THREE.MeshPhongMaterial({
            color: 0x44aa88
        })
    /**
     * 再创建一个网格（Mesh）对象
     * 这个对象包含了以下几个东西
     * 1、几何体 Geometry
     * 2、材质 material
     * 3、对象在场景中都是相对于他的父对象的位置朝向和缩放
     */
    const cube = new THREE.Mesh(geometry, material)
    /**
     * 添加进场景中
     */
    scene.add(cube)

    /**
     * 添加光照
     */
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    function animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera)
        requestAnimationFrame( animate );
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
#c {
  width: 30vw;
  height: 30vh;
}
</style>
