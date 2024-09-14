import * as THREE from 'three'
import {PerspectiveCamera, Scene, WebGLRenderer} from "three";

class Init3D {
    private canvas: HTMLElement;
    private renderer: WebGLRenderer;
    private camera: PerspectiveCamera;
    private scene: Scene;
    constructor() {
        this.canvas = document.getElementById('c') as HTMLElement
        /**
         * 创建一个渲染器
         * 可以将自己创建侧canvas这个DOM传入参数作为渲染的容器
         * 如果不传入canvas Three会自己创建一个dom
         */
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.canvas
        })
        /**
         * 创建摄像机
         * fov - 视野角度
         * aspect - 画布的宽高比
         * near - 近平面
         * far - 远平面
         * 近远平面决定了当距离大于far或者小于near的时候物体都会被裁剪掉
         */
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
        this.camera.position.z = 5;
        /**
         * 创建一个场景
         */
        this.scene = new THREE.Scene()
    }
    public resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }
}

export default Init3D