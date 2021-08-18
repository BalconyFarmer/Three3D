<template>
    <div id='rightToolClassSub'>
        <strong>类型:</strong>
        {{ this.meshData.type }}
        <div>
            <strong>matrix</strong>
            <div>
                <div id="mathViewer0">{{ this.meshData.matrix[0] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrix[1] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrix[2] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrix[3] }}</div>
            </div>
            <div>
                <div id="mathViewer0">{{ this.meshData.matrix[4] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrix[5] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrix[6] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrix[7] }}</div>
            </div>
            <div>
                <div id="mathViewer0">{{ this.meshData.matrix[8] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrix[9] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrix[10] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrix[11] }}</div>
            </div>
            <div>
                <div id="mathViewer0">{{ this.meshData.matrix[12] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrix[13] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrix[14] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrix[15] }}</div>
            </div>
        </div>

        <strong>matrixWorld</strong>
        <div>
            <div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[0] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[1] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[2] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[3] }}</div>
            </div>
            <div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[4] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[5] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[6] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[7] }}</div>
            </div>
            <div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[8] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[9] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[10] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[11] }}</div>
            </div>
            <div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[12] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[13] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[14] }}</div>
                <div id="mathViewer0">{{ this.meshData.matrixWorld[15] }}</div>
            </div>
        </div>

        <div>
            <strong>Euler</strong>
            <br>
            <div id="mathViewer0">{{ this.meshData.euler.x }}</div>
            <div id="mathViewer0">{{ this.meshData.euler.y }}</div>
            <div id="mathViewer0">{{ this.meshData.euler.z }}</div>
            <div id="mathViewer0">{{ this.meshData.euler.order }}</div>
        </div>
        <div>
            <strong>Quaternion</strong>
            <br>
            <div id="mathViewer0">{{ this.meshData.Quaternion.x }}</div>
            <div id="mathViewer0">{{ this.meshData.Quaternion.y }}</div>
            <div id="mathViewer0">{{ this.meshData.Quaternion.z }}</div>
            <div id="mathViewer0">{{ this.meshData.Quaternion.w }}</div>
        </div>
        <div>
            <strong>scale</strong>
            <br>
            <div id="mathViewer0">{{ this.meshData.scale.x }}</div>
            <div id="mathViewer0">{{ this.meshData.scale.y }}</div>
            <div id="mathViewer0">{{ this.meshData.scale.z }}</div>
        </div>
        <div>
            <strong>position</strong>
            <br>
            <div id="mathViewer0">{{ this.meshData.position.x }}</div>
            <div id="mathViewer0">{{ this.meshData.position.y }}</div>
            <div id="mathViewer0">{{ this.meshData.position.z }}</div>
        </div>

    </div>

</template>

<script>
export default {
    props: {
        app3D: Object,
        required: true
    },
    data() {
        return {
            meshData: {
                type: null,
                matrix: [],
                matrixWorld: [],
                euler: {
                    x: null,
                    y: null,
                    z: null,
                    order: null
                },
                Quaternion: {
                    x: null,
                    y: null,
                    z: null,
                    w: null
                },
                scale: {
                    x: null,
                    y: null,
                    z: null
                },
                position: {
                    x: null,
                    y: null,
                    z: null
                },
                rotation: null,
            },

        }
    },
    methods: {
        onChangeMesh(event) {
            console.log("event.message", event.message)

            this.meshData.type = event.message.type
            this.meshData.matrix = []
            event.message.matrix.elements.forEach(item => {
                this.meshData.matrix.push(item.toFixed(2))
            })

            this.meshData.matrixWorld = []
            event.message.matrixWorld.elements.forEach(item => {
                this.meshData.matrixWorld.push(item.toFixed(2))
            })

            this.meshData.euler.x = event.message.rotation._x.toFixed(2)
            this.meshData.euler.y = event.message.rotation._y.toFixed(2)
            this.meshData.euler.z = event.message.rotation._z.toFixed(2)
            this.meshData.euler.order = event.message.rotation.order

            this.meshData.Quaternion.x = event.message.quaternion.x.toFixed(2)
            this.meshData.Quaternion.y = event.message.quaternion.y.toFixed(2)
            this.meshData.Quaternion.z = event.message.quaternion.z.toFixed(2)
            this.meshData.Quaternion.w = event.message.quaternion.w.toFixed(2)

            this.meshData.scale.x = event.message.scale.x.toFixed(2)
            this.meshData.scale.y = event.message.scale.y.toFixed(2)
            this.meshData.scale.z = event.message.scale.z.toFixed(2)

            this.meshData.position.x = event.message.position.x.toFixed(2)
            this.meshData.position.y = event.message.position.y.toFixed(2)
            this.meshData.position.z = event.message.position.z.toFixed(2)

        },
    },
    mounted() {
        this.$nextTick(function () {
            this.app3D.eventBus.addEventListener('changeMesh', this.onChangeMesh.bind(this))
        })
    }
}
</script>
<style lang="less">
#rightToolClassSub {
    display: inline;
    float: left;
    width: 275px;
    border: solid #99A1A9 1px;

    strong {
        color: #87e8de;
    }
}
</style>
