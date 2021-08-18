import * as THREE from "three";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";

export class FirstPersonControls {
    constructor(app, personalControlPosition, lookPosition) {
        this.app = app
        this.personalControlPosition = personalControlPosition
        this.lookPosition = lookPosition
        this.plane = this.personalControlPosition.y

        this.controls = null
        this.control = null
        this.velocity = new THREE.Vector3();  //移动速度变量
        this.direction = new THREE.Vector3(); //移动的方向变量

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.spaceUp = true; //处理一直按着空格连续跳的问题
        this.upSpeed = 200; //控制跳起时的速度

        this.instructions = document.getElementById('instructions');
        this.blocker = document.getElementById('blocker');

        this._onKeyDown = this.onKeyDown.bind(this)
        this._onKeyUp = this.onKeyUp.bind(this)

        this.initPersonalControls()
        this.initMenu()
    }

    initPersonalControls() {

        this.controls = new PointerLockControls(this.app.camera, document.body);
        this.control = this.controls.getObject()
        this.control.position.x = this.personalControlPosition.x;
        this.control.position.y = this.personalControlPosition.y;
        this.control.position.z = this.personalControlPosition.z;
        this.control.lookAt(this.lookPosition)
        this.controls.lock() // 开启 unlock

        const self = this
        this.app.renderQueue.push(
            function loopFirstPersonControls() {
                self.render.bind(self)()
            }
        )

        document.addEventListener('keydown', this._onKeyDown, false);
        document.addEventListener('keyup', this._onKeyUp, false);

    }


    render() {
        console.warn('FirstPersonControls run')
        const delta = this.app.clock.getDelta();

        //velocity每次的速度，为了保证有过渡
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= 9.8 * 100.0 * delta; // 默认下降的速度

        //获取当前按键的方向并获取朝哪个方向移动
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveLeft) - Number(this.moveRight);
        //将法向量的值归一化
        this.direction.normalize();

        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta;

        //根据速度值移动控制器
        this.controls.moveRight(this.velocity.x * delta);
        this.controls.getObject().position.y += (this.velocity.y * delta); // new behavior

        // 地面碰撞测试
        if (this.control.position.y < this.plane) {
            this.velocity.y = 0;
            this.control.position.y = this.plane;
            this.canJump = true;
        }

        // 前碰撞测试 // back left right
        const orign = this.control.position
        const direction = new THREE.Vector3()
        this.control.getWorldDirection(direction)
        const horizontalRaycaster = new THREE.Raycaster(orign, direction, 0, 100);
        horizontalRaycaster.camera = this.control

        const horizontalIntersections = horizontalRaycaster.intersectObjects(this.app.scene.children, true);
        const horOnObject = horizontalIntersections.length > 0;

        if (horizontalIntersections[0]) {
            if (horizontalIntersections[0].distance < 3) {
            } else {
                this.controls.moveForward(-this.velocity.z * delta);
            }
        } else {
            this.controls.moveForward(-this.velocity.z * delta);
        }
    }

    onKeyDown(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = true;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = true;
                break;
            case 32: // space
                if (this.canJump && this.spaceUp) this.velocity.y += this.upSpeed;
                this.canJump = false;
                this.spaceUp = false;
                break;
        }
    };

    onKeyUp(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = false;
                break;
            case 32: // space
                this.spaceUp = true;
                break;
        }
    };

    initMenu() {

        //实现鼠标锁定的教程地址 http://www.html5rocks.com/en/tutorials/pointerlock/intro/
        const havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
        if (havePointerLock) {
            const element = document.body;
            const pointerlockchange = function (event) {
                if (this.blocker && this.instructions) {
                    if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                        this.controls.enabled = true;
                        if (this.blocker) {
                            this.blocker.style.display = 'none';
                        }
                    } else {
                        this.controls.enabled = false;
                        this.blocker.style.display = 'block';
                        this.instructions.style.display = '';
                    }
                }

            };

            const pointerlockerror = function (event) {
                this.instructions.style.display = '';
            };

            // 监听变动事件
            document.addEventListener('pointerlockchange', pointerlockchange.bind(this), false);
            document.addEventListener('mozpointerlockchange', pointerlockchange.bind(this), false);
            document.addEventListener('webkitpointerlockchange', pointerlockchange.bind(this), false);
            document.addEventListener('pointerlockerror', pointerlockerror.bind(this), false);
            document.addEventListener('mozpointerlockerror', pointerlockerror.bind(this), false);
            document.addEventListener('webkitpointerlockerror', pointerlockerror.bind(this), false);

            const self = this
            if (this.instructions) {
                this.instructions.onclick = function (event) {
                    self.instructions.style.display = 'none';
                    self.blocker.style.display = 'none';
                    self.app.controls.startOrbitControls()
                    event.stopPropagation();
                }
            }

        } else {
            this.instructions.innerHTML = '你的浏览器不支持相关操作，请更换浏览器';
        }
    }

    destroy() {
        this.app.removeFromQueue('loopFirstPersonControls')
    }

}

