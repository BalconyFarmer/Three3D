<template>
    <div id="KFLC">
        <a-tree show-line :default-expanded-keys="['0-0-0']" @select="onSelect">
            <a-icon slot="switcherIcon" type="down"/>
            <a-tree-node key="0-0" title="动画 1">
                <a-tree-node key="0-0-0" title="对象 1-0">
                    <a-tree-node key="0-0-0-0" title="属性"/>
                    <a-tree-node key="0-0-0-1" title="属性"/>
                    <a-tree-node key="0-0-0-2" title="属性"/>
                </a-tree-node>
                <a-tree-node key="0-0-1" title="对象 1-1">
                    <a-tree-node key="0-0-1-0" title="属性"/>
                    <a-tree-node key="0-0-1-0" title="属性"/>
                    <a-tree-node key="0-0-1-0" title="属性"/>
                    <a-tree-node key="0-0-1-0" title="属性"/>
                </a-tree-node>
            </a-tree-node>
        </a-tree>
    </div>
</template>

<script>
export default {
    name: 'KeyFrameLeft',
    props: {},
    methods: {
        onSelect(selectedKeys, info) {
            console.log('selected', selectedKeys, info);
        },
    },
}
</script>

<style lang="less">
@import '../../0main.less';

#KFLC {
    .ant-tree.ant-tree-show-line li span.ant-tree-switcher {
        color: rgb(200 200 200);
        background: @center;
    }

    .ant-tree li .ant-tree-node-content-wrapper {
        color: rgb(255, 255, 255);
    }
}
</style>
