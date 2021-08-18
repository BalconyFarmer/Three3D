import * as THREE from "three";
import {RaycasterHelper} from './RaycasterHelper'

import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass.js';

export class OutlineShineEffect {
    constructor(app) {
        this.app = app
        this.mesh = null
        this.composer = null
        this.RaycasterHelper = null
        this.outlinePass = null
    }

    run() {
        const self = this
        this.RaycasterHelper = new RaycasterHelper(this.app)
        this.RaycasterHelper.startHover()
        this.RaycasterHelper.atSelectMesh(function (mesh) {
            if (mesh) {
                if (mesh.cname != 'raycasterMesh') {
                    self.mesh = mesh
                }
            } else {
                self.mesh = null
            }
        })

        this.composer = new EffectComposer(this.app.renderer);
        const renderPass = new RenderPass(this.app.scene, this.app.camera);
        this.composer.addPass(renderPass);
        this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.app.scene, this.app.camera);
        this.composer.addPass(this.outlinePass);

        this.addRender()
    }

    addRender() {
        const self = this
        this.app.renderQueue.push(
            function updateStats() {
                if (self.mesh) {
                    self.outlinePass.selectedObjects = [self.mesh];
                } else {
                    self.outlinePass.selectedObjects = []; // 清除
                }
                self.composer.render();
            }
        )
    }

}
