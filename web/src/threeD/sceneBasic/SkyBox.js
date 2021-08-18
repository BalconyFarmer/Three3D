import * as THREE from "three";
import {serverAdress} from '@/config';

export class SkyBox {
    constructor(app) {
        this.app = app
    }

    addSkyBox() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            serverAdress + '/3Dstatic/skybox/px.jpg',
            serverAdress + '/3Dstatic/skybox/nx.jpg',
            serverAdress + '/3Dstatic/skybox/py.jpg',
            serverAdress + '/3Dstatic/skybox/ny.jpg',
            serverAdress + '/3Dstatic/skybox/pz.jpg',
            serverAdress + '/3Dstatic/skybox/nz.jpg',
        ]);
        this.app.scene.background = texture;
    }

    addJpgBackground() {
        const loader = new THREE.TextureLoader();
        const bgTexture = loader.load(serverAdress + '/3Dstatic/skybox/py.jpg');
        this.app.scene.background = bgTexture;

        // 背景拉伸解决办法
        /*        const canvasAspect = canvas.clientWidth / canvas.clientHeight;
                const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
                const aspect = imageAspect / canvasAspect;

                bgTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
                bgTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;

                bgTexture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
                bgTexture.repeat.y = aspect > 1 ? 1 : aspect;*/
    }
}
