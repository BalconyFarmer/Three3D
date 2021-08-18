<template>
    <div id="rightContainer">

        <ExperimentAreaRightAllClass :app3D='app3D' v-if="allClassShow"></ExperimentAreaRightAllClass>
        <ExperimentAreaRightMaterial :app3D='app3D' v-if="allMaterial"></ExperimentAreaRightMaterial>
        <ExperimentAreaRightGeometries :app3D='app3D' v-if="allGeometries"></ExperimentAreaRightGeometries>
        <ExperimentAreaRightStaticsModels :app3D='app3D' v-if="StaticsModels"></ExperimentAreaRightStaticsModels>
        <ExperimentAreaRightTransform :app3D='app3D' v-if="transformShow "></ExperimentAreaRightTransform>

        <div id='rightToolClass'>
            <a-tooltip placement="left">
                <template slot="title">
                    prompt text
                </template>
                <div :class="allClassShow?'rightToolClassSubSelect': 'rightToolClassSub'">
                    <a-icon type="branches" @click="turnOnAllClass" style="color: #ffffff"/>
                </div>
            </a-tooltip>

            <a-tooltip placement="left">
                <template slot="title">
                    材质
                </template>
                <div :class="allMaterial?'rightToolClassSubSelect': 'rightToolClassSub'">
                    <a-icon type="environment" @click="turnMaterial" style="color: #ffffff"/>
                </div>
            </a-tooltip>

            <a-tooltip placement="left">
                <template slot="title">
                    几何体
                </template>
                <div :class="allGeometries?'rightToolClassSubSelect': 'rightToolClassSub'">
                    <a-icon type="environment" @click="turnGeometries" style="color: #ffffff"/>
                </div>
            </a-tooltip>

            <a-tooltip placement="left">
                <template slot="title">
                    OBJ
                </template>
                <div :class="StaticsModels?'rightToolClassSubSelect': 'rightToolClassSub'">
                    <a-icon type="environment" @click="turnStaticsModels" style="color: #ffffff"/>
                </div>
            </a-tooltip>

            <a-tooltip placement="left">
                <template slot="title">
                    TRANSFORM
                </template>
                <div :class="transformShow?'rightToolClassSubSelect': 'rightToolClassSub'">
                    <a-icon type="api" @click="turnOnTransformShow" style="color: #ffffff"/>
                </div>
            </a-tooltip>

        </div>

    </div>
</template>

<script>
import ExperimentAreaRightTransform from './ExperimentAreaRightTransform'
import ExperimentAreaRightAllClass from './ExperimentAreaRightAllClass'
import ExperimentAreaRightMaterial from './ExperimentAreaRightMaterial'
import ExperimentAreaRightGeometries from './ExperimentAreaRightGeometries'
import ExperimentAreaRightStaticsModels from './ExperimentAreaRightStaticsModels'

export default {
    props: {
        app3D: Object,
        required: true
    },
    components: {
        ExperimentAreaRightTransform,
        ExperimentAreaRightAllClass,
        ExperimentAreaRightMaterial,
        ExperimentAreaRightGeometries,
        ExperimentAreaRightStaticsModels
    },
    data() {
        return {
            allClassShow: true,
            allMaterial: false,
            allGeometries: false,
            StaticsModels: false,
            transformShow: false,
        }
    },
    methods: {
        turnOnTransformShow() {
            this.transformShow = true
            this.allClassShow = false
            this.allMaterial = false
            this.allGeometries = false
            this.StaticsModels = false
        },
        turnOnAllClass() {
            this.transformShow = false
            this.allClassShow = true
            this.allMaterial = false
            this.allGeometries = false
            this.StaticsModels = false
        },
        turnMaterial() {
            this.transformShow = false
            this.allClassShow = false
            this.allMaterial = true
            this.allGeometries = false
            this.StaticsModels = false
        },
        turnGeometries() {
            this.transformShow = false
            this.allClassShow = false
            this.allMaterial = false
            this.allGeometries = true
            this.StaticsModels = false
        },
        turnStaticsModels() {
            this.transformShow = false
            this.allClassShow = false
            this.allMaterial = false
            this.allGeometries = false
            this.StaticsModels = true
        }
    },
    mounted() {
    }
}
</script>

<style lang="less">
@import '../0main.less';

#rightContainer {
    position: absolute;
    left: calc(100vw - 300px);
    top: 46px;
    width: 300px;
    height: auto;
    background-color: @center;

    #rightToolClass {
        display: inline-block;
        float: left;
        width: 25px;
        height: calc(100vh);
        background-color: @outer;
        box-shadow: 1px 1px 1px #7BA4B4;

        .rightToolClassSub {
            margin-top: 10px;
            display: inline-block;
            //background: #1890FF;
        }

        .rightToolClassSubSelect {
            margin-top: 10px;
            display: inline-block;
            background: #1890FF;
        }
    }

    #rightToolClassSub {
        display: inline;
        float: left;
        width: 275px;
        box-shadow: 1px 1px 1px #7BA4B4;

        strong {
            color: #87e8de;
        }
    }


}
</style>
