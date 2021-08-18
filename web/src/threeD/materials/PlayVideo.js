import * as THREE from "three";

export class PlayVideo {
    constructor(app) {
        this.app = app
        this.mesh = null
    }

    creatVideoDom() {
    }

    mamkeMesh() {
        // 创建video对象
        let video = document.createElement('video');
        video.src = "http://localhost:1111/3Dstatic/video/pythonVideo.mp4"; // 设置视频地址
        video.crossOrigin = '*'
        video.autoplay = "autoplay"; //要设置播放
        // video对象作为VideoTexture参数创建纹理对象
        const texture = new THREE.VideoTexture(video)
        const geometry = new THREE.PlaneGeometry(108, 71); //矩形平面
        const material = new THREE.MeshPhongMaterial({
            map: texture, // 设置纹理贴图
        }); //材质对象Material
        const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh

        this.app.scene.add(mesh); //网格模型添加到场景中
    }

}
