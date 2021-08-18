import * as THREE from "three";

import {ButtonMesh} from './GUIMeshPart/ButtonMesh'
import {CheckBoxMesh} from './GUIMeshPart/CheckBoxMesh'
import {SliderMesh} from './GUIMeshPart/SliderMesh'
import {InputMesh} from './GUIMeshPart/InputMesh'
import {TextBlockMesh} from './GUIMeshPart/TextBlockMesh'
import {ImgMesh} from './GUIMeshPart/ImgMesh'
import {serverAdress} from '@/config';

/**
 * 3DCanvas example
 */
export class GUIApp {
    constructor(app) {
        this.app = app
        this.GUIList = []
        this.canvasDomsDestroy = []

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectMesh = null

        document.addEventListener('mousedown', this.atMouseDown.bind(this), false);
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        document.addEventListener('mouseup', this.atMouseUp.bind(this), false);
    }

    start() {
        this.make2DButton(160, 20, 'First Person', new THREE.Vector3(500, 500, 0), '10px', 20, 40)
        this.make2DText(160, 115, 'First Person', new THREE.Vector3(500, 500, 0), '10px', 20, 40)
        this.make2dImg()
        this.make2DSlider()
        this.make2dCheckBox()
        this.make2DInput()

        this.makeFixedBtn(500, 200, 'First Person', new THREE.Vector3(250, 250, 250), '100px', 0, 200)
        this.makeFixedText(160, 50, 'First Person', new THREE.Vector3(250, 250, 0), '40px', 0, 40)
        this.makeFixedImg()
        this.makeFixedSlider()
        this.makeFixedCheckBOx('hello')
        this.makeFixedInput('请输入')

        this.makeVerticalBTN(160, 20, 'First Person', new THREE.Vector3(500, 500, 0), '10px', 20, 40)
        this.makeVerticalText(160, 115, 'First Person', new THREE.Vector3(500, 500, 0), '10px', 20, 40)
        this.makeVerticalImg()
        this.makeVerticalSlider()
        this.makeVerticalCheckBox()
        this.makeVerticalInput()
    }

    make2DSlider() {
        const positionSlider = new THREE.Vector3(900, 250, 200)
        this.sliderBoxMesh = new SliderMesh(this.app, this, "2D", 200, 50, positionSlider, 'selected')
        if (this.sliderBoxMesh.mesh) {
            this.sliderBoxMesh.mesh.translateX(300)
            this.sliderBoxMesh.mesh.translateY(0)
            this.sliderBoxMesh.mesh.translateZ(0)

            this.sliderBoxMesh.mesh.scale.x = 0.2
            this.sliderBoxMesh.mesh.scale.y = 0.2
            this.sliderBoxMesh.mesh.scale.z = 0.2

            this.GUIList.push(this.sliderBoxMesh.mesh)
        }
    }

    make2DButton(width, height, text, position, fontSize, leftPosition, topPosition) {
        this.button = new ButtonMesh(this.app, this, '2D', leftPosition, topPosition, width, height, position, text, fontSize)

        if (this.button.mesh) {
            this.GUIList.push(this.button.mesh)
        }
    }

    make2dImg() {
        const imgUrl = document.createElement('img')
        imgUrl.src = serverAdress + '/3Dstatic/model3D/headExample.png'

        const buttonPosition = new THREE.Vector3(900, 600, 0) //2D位置
        this.imgMesh = new ImgMesh(this.app, this, '2D', 100, 30, buttonPosition, imgUrl)

        if (this.imgMesh.mesh) {
            this.GUIList.push(this.imgMesh.mesh)
        }
    }

    make2dCheckBox() {
        const position = new THREE.Vector3(900, 130, 0)
        this.checkBoxMesh = new CheckBoxMesh(this.app, this, "2D", 100, 100, position, 'selected112')
        if (this.checkBoxMesh.mesh) {

            this.checkBoxMesh.mesh.translateX(150)
            this.checkBoxMesh.mesh.translateY(0)
            this.checkBoxMesh.mesh.translateZ(0)

            this.GUIList.push(this.checkBoxMesh.mesh)
        }

    }

    make2DInput() {
        const positionInput = new THREE.Vector3(900, 350, 0)
        this.inputMesh = new InputMesh(this.app, this, "2D", 500, 50, positionInput, 'click input')
    }

    make2DText(width, height, text, position, fontSize, leftPosition, topPosition) {
        this.textMesh = new TextBlockMesh(this.app, this, "2D", width, height, position, text, fontSize, leftPosition, topPosition)
    }

    makeFixedImg() {
        const imgUrl = document.createElement('img')
        imgUrl.src = serverAdress + '/3Dstatic/model3D/headExample.png'

        const buttonPosition = new THREE.Vector3(900, 0, 0) //2D位置
        this.imgFixed = new ImgMesh(this.app, this, '3DFixed', 100, 100, buttonPosition, imgUrl)

        this.imgFixed.onChangeValue((value) => {
            console.log(value)
        })
    }

    makeFixedBtn(width, height, text, position, fontSize, leftPosition, topPosition) {
        this.buttonFixed = new ButtonMesh(this.app, this, '3DFixed', leftPosition, topPosition, width, height, position, text, fontSize)

        if (this.buttonFixed.mesh) {
            this.GUIList.push(this.buttonFixed.mesh)
        }

        this.buttonFixed.addEventListener('click', function () {
            console.log('点击了btnMesh')
        })
    }

    makeFixedCheckBOx(text) {
        const position = new THREE.Vector3(0, 0, 0)
        this.checkBoxMeshFixed = new CheckBoxMesh(this.app, this, "3DFixed", 100, 100, position, text)
        if (this.checkBoxMeshFixed.mesh) {
            this.GUIList.push(this.checkBoxMeshFixed.mesh)
            return this.checkBoxMeshFixed.mesh
        }
    }

    makeFixedSlider(text) {
        const positionSlider = new THREE.Vector3(0, 0, 0)
        this.sliderBoxMeshFixed = new SliderMesh(this.app, this, "3DFixed", 200, 50, positionSlider, 'selected')
        if (this.sliderBoxMeshFixed.mesh) {
            this.GUIList.push(this.sliderBoxMeshFixed.mesh)
            this.sliderBoxMeshFixed.onChangeValue((value) => {
                console.log('slider', value)
            })
            return this.sliderBoxMeshFixed.mesh
        }
    }

    makeFixedInput(text) {
        const positionInput = new THREE.Vector3(0, 0, 0)
        this.inputMeshFixed = new InputMesh(this.app, this, "3DFixed", 300, 50, positionInput, text)
        if (this.inputMeshFixed.mesh) {
            this.GUIList.push(this.inputMeshFixed.mesh)
            return this.inputMeshFixed.mesh
        }
    }

    makeFixedText(width, height, text, position, fontSize, leftPosition, topPosition) {
        this.textMeshFixed = new TextBlockMesh(this.app, this, "3DFixed", width, height, position, text, fontSize, leftPosition, topPosition)
        if (this.textMeshFixed.mesh) {
            this.textMeshFixed.mesh.translateX(position.x)
            this.textMeshFixed.mesh.translateY(position.y + height / 2)
            this.textMeshFixed.mesh.translateZ(position.z)
            this.GUIList.push(this.textMeshFixed.mesh)
        }
    }

    makeVerticalImg() {
        const imgUrl = document.createElement('img')
        imgUrl.src = serverAdress + '/3Dstatic/model3D/headExample.png'
        const buttonPosition = new THREE.Vector3(800, 100, 0) //2D位置
        this.imgVertical = new ImgMesh(this.app, this, '3DVertical', 100, 30, buttonPosition, imgUrl)
    }

    makeVerticalBTN(width, height, text, position, fontSize, leftPosition, topPosition) {
        this.buttonVertical = new ButtonMesh(this.app, this, '3DVertical', leftPosition, topPosition, width, height, position, text, fontSize)
        if (this.buttonVertical.mesh) {
            this.buttonVertical.mesh.translateX(position.x)
            this.buttonVertical.mesh.translateY(position.y + height / 2)
            this.buttonVertical.mesh.translateZ(position.z)
            this.GUIList.push(this.buttonVertical.mesh)
        }

        return this.buttonVertical
    }

    makeVerticalCheckBox() {
        /**
         * width height 为正方形选框 height 根据文字自动生成
         */
        const position = new THREE.Vector3(0, 0, 0)
        this.checkBoxMeshVertical = new CheckBoxMesh(this.app, this, "3DVertical", 20, 20, position, 'selected112')
        if (this.checkBoxMeshVertical.mesh) {
            this.GUIList.push(this.checkBoxMeshVertical.mesh)
        }
    }

    makeVerticalSlider() {
        const positionSlider = new THREE.Vector3(0, 0, 0)
        this.sliderBoxMeshVertical = new SliderMesh(this.app, this, "3DVertical", 80, 20, positionSlider, 'selected')
        if (this.sliderBoxMeshVertical.mesh) {
            this.GUIList.push(this.sliderBoxMeshVertical.mesh)
        }
    }

    makeVerticalInput() {
        const positionInput = new THREE.Vector3(0, 0, 0)
        this.inputMeshVertical = new InputMesh(this.app, this, "3DVertical", 80, 20, positionInput, 'click input')
        if (this.inputMeshVertical.mesh) {
            this.GUIList.push(this.inputMeshVertical.mesh)
        }
    }

    makeVerticalText(width, height, text, position, fontSize, leftPosition, topPosition) {
        this.inputMeshVertical = new TextBlockMesh(this.app, this, "3DVertical", width, height, position, text, fontSize, leftPosition, topPosition)
        if (this.inputMeshVertical.mesh) {
            this.inputMeshVertical.mesh.translateX(position.x)
            this.inputMeshVertical.mesh.translateY(position.y + height / 2)
            this.inputMeshVertical.mesh.translateZ(position.z)
            this.GUIList.push(this.inputMeshVertical.mesh)
        }
    }

    atMouseDown(event) {
        this.mouse.x = (event.offsetX / this.app.dom.width) * 2 - 1;
        this.mouse.y = -(event.offsetY / this.app.dom.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.app.camera);
        if (this.GUIList) {
            const intersects = this.raycaster.intersectObjects(this.GUIList);
            if (intersects.length > 0) {
                if (intersects[0].object) {
                    if (intersects[0].object.UIParent) {
                        this.selectMesh = intersects[0].object
                        const casterPoint = intersects[0].point
                        this.selectMesh.UIParent.atMouseDown(casterPoint)
                    }
                }
            }
        } else {
        }
    }

    onMouseMove(event) {
        if (this.selectMesh) {
            this.mouse.x = (event.offsetX / this.app.dom.width) * 2 - 1;
            this.mouse.y = -(event.offsetY / this.app.dom.height) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.app.camera);
            const intersects = this.raycaster.intersectObjects(this.GUIList);
            if (intersects.length > 0) {
                if (this.selectMesh === intersects[0].object) {
                    this.app.controls.controller.enableRotate = false
                    const casterPoint = intersects[0].point
                    this.selectMesh.UIParent._onMouseMove(casterPoint)
                }
            }
        }
    }

    atMouseUp(event) {
        this.mouse.x = 0
        this.mouse.y = 0
        if (this.selectMesh != null) {
            if (this.selectMesh.UIParent) {
                this.selectMesh.UIParent.atMouseUp()
                this.selectMesh = null
                this.app.controls.controller.enableRotate = true
            }
        }
    }

    destroy() {
        this.canvasDomsDestroy.forEach(item => {
            document.body.removeChild(item)
        })
    }

}





