import * as THREE from "three";
import {serverAdress} from '@/config';

export class Sound {
    constructor(app) {
        this.app = app
    }

    start() {
        const buttonDom = document.createElement("button")
        buttonDom.style.position = 'fixed'
        buttonDom.style.left = '500px'
        buttonDom.style.top = '500px'
        buttonDom.innerHTML = '播放音乐'
        const self = this
        buttonDom.onclick = function () {
            self._onclick()
        }
        document.body.appendChild(buttonDom)
    }

    _onclick() {
        // 非位置音频可用于不考虑位置的背景音乐
        // 创建一个监听者
        const listener = new THREE.AudioListener();
        // camera.add( listener );
        // 创建一个非位置音频对象  用来控制播放
        const audio = new THREE.Audio(listener);
        // 创建一个音频加载器对象
        const audioLoader = new THREE.AudioLoader();
        // 加载音频文件，返回一个音频缓冲区对象作为回调函数参数
        audioLoader.load(serverAdress + '/3Dstatic/sounds/breathandlife.mp3', function (AudioBuffer) {
            // 音频缓冲区对象关联到音频对象audio
            audio.setBuffer(AudioBuffer);
            audio.setLoop(true); //是否循环
            audio.setVolume(0.5); //音量
            // 播放缓冲区中的音频数据
            audio.play(); //play播放、stop停止、pause暂停
        });
    }

    addSoundMesh() {
        // 用来定位音源的网格模型
        const audioMesh = new THREE.Mesh(geometry, material);
        // 设置网格模型的位置，相当于设置音源的位置
        audioMesh.position.set(0, 0, 300);
        scene.add(audioMesh);

        // 创建一个虚拟的监听者
        const listener = new THREE.AudioListener();
        // 监听者绑定到相机对象
        camera.add(listener);
        // 创建一个位置音频对象,监听者作为参数,音频和监听者关联。
        const PosAudio = new THREE.PositionalAudio(listener);
        //音源绑定到一个网格模型上
        audioMesh.add(PosAudio);
        // 创建一个音频加载器
        const audioLoader = new THREE.AudioLoader();
        // 加载音频文件，返回一个音频缓冲区对象作为回调函数参数
        audioLoader.load('./中国人.mp3', function (AudioBuffer) {
            // console.log(buffer);
            // 音频缓冲区对象关联到音频对象audio
            PosAudio.setBuffer(AudioBuffer);
            PosAudio.setVolume(0.9); //音量
            PosAudio.setRefDistance(200); //参数值越大,声音越大
            PosAudio.play(); //播放
        });
    }

}
