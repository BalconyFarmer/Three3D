<template>
    <div id="leftContainer" @click="getMeshByUUIDDispose">
        <div id='leftToolClass'>
            <div class="rightToolClassSub">
                <a-icon type="api" style="color: #ffffff"/>
            </div>
            <div class="rightToolClassSub">
                <a-icon type="environment" style="color: #ffffff"/>
            </div>
            <div class="rightToolClassSub">
                <a-icon type="eye-invisible" style="color: #ffffff"/>
            </div>
        </div>

        <div id="leftToolClassSub">
            <a-tree
                show-line
                v-model="checkedKeys"
                checkable
                :expanded-keys="expandedKeys"
                :auto-expand-parent="autoExpandParent"
                :selected-keys="selectedKeys"
                :tree-data="treeData"
                @expand="onExpand"
                @select="onSelect"
                @click="clickTree"
                @rightClick="onRightClick"
            />

            <div id="leftSubMenu" v-if="leftSubMenu">
                <a-button type="primary" size="small" @click="addAnimationv">
                    添加动画
                </a-button>
            </div>
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
            expandedKeys: [],
            autoExpandParent: true,
            checkedKeys: [],
            selectedKeys: [],
            treeData: [],
            leftSubMenu: false,
            rightSelectMeshUUID: null
        }
    },
    watch: {
        checkedKeys(val) {
            console.log('onCheck', val);
        },
    },
    methods: {
        addAnimationv() {
            this.leftSubMenu = false
            const see = this.rightSelectMeshUUID
            this.$parent.startAnimatioinEditor()
            this.rightSelectMeshUUID = null
        },
        onRightClick(selectedKeys) {
            const eventKey = selectedKeys.node.eventKey
            const event = selectedKeys.event
            this.leftSubMenu = true
            this.$nextTick(function () {
                const dom = document.getElementById('leftSubMenu')
                const father = document.getElementById('leftToolClassSub')
                const res = father.getClientRects()
                dom.style.left = event.clientX.toString() + 'px'
                dom.style.top = event.clientY.toString() - res[0].top + 'px'
            })
            this.rightSelectMeshUUID = selectedKeys.node.eventKey
        },
        onExpand(expandedKeys) {
            // console.log('onExpand', expandedKeys);
            // if not set autoExpandParent to false, if children expanded, parent can not collapse.
            // or, you can remove all expanded children keys.
            this.expandedKeys = expandedKeys;
            this.autoExpandParent = false;
        },
        onCheck(checkedKeys) {
            this.checkedKeys = checkedKeys;
        },
        onSelect(selectedKeys, info) {
            debugger
            this.app3D.getMeshByUUID(selectedKeys)
            this.selectedKeys = selectedKeys;
        },
        updateTreeData() {
            this.treeData = this.app3D.getSceneChildren()
        },
        clickTree(e) {
            e.stopPropagation()
        },
        getMeshByUUIDDispose() {
            this.app3D.getMeshByUUIDDispose()
            this.selectedKeys = []
        }
    },
    mounted() {
        this.$nextTick(function () {
            this.treeData = this.app3D.getSceneChildren()
            this.app3D.eventBus.addEventListener('updateLeftTreeData', this.updateTreeData.bind(this))
        })
    }
};
</script>

<style lang="less">
@import '../0main.less';

/*定义滚动条高宽及背景
 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar {
    width: 6px;
    height: 16px;
    background-color: #F5F5F5;
}

/*定义滚动条轨道
 内阴影+圆角*/
::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    background-color: #F5F5F5;
}

/*定义滑块
 内阴影+圆角*/
::-webkit-scrollbar-thumb {
    //border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
    background-color: #555;
}

#leftContainer {
    position: absolute;
    left: 0px;
    top: 46px;
    background-color: @center;
    overflow: auto;
    width: 300px;
    height: calc(100vh);
    border: solid #99A1A9 1px;

    #leftToolClass {
        display: inline;
        float: left;
        background-color: @outer;
        width: 25px;
        height: calc(100vh);
        box-shadow: 1px 1px 1px #7BA4B4;

        .rightToolClassSub {
            margin-top: 10px;
            display: inline-block;
            background: #1890FF;
        }
    }

    #leftToolClassSub {
        display: inline;
        float: left;
        margin-left: 2px;

        #leftSubMenu {
            position: absolute;
            left: 100px;
            height: 100px;
        }

        .anticon svg {
            display: inline-block;
            color: white;
        }

        .ant-tree.ant-tree-show-line li span.ant-tree-switcher {
            color: rgba(0, 0, 0, 0.45);
            background: @center;
        }

        .ant-tree li .ant-tree-node-content-wrapper {
            color: #87e8de;
        }

        .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
            background-color: #1890FF;
        }

    }
}
</style>
