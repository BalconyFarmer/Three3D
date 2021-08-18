// 说明链接: https://juejin.im/post/5d358280e51d4556bc06704d
import Vue from 'vue';

const Bus = new Vue();
const eventBus = {
    TYPES: { // 'TYPES'
        EVENT1: { // 'TYPES.EVENT1'
            EDIT: { // 'TYPES.EVENT1.EDIT'
                INVOKE: {},
                CANCEL: {}, // 'TYPES.EVENT1.EDIT.CANCEL'
                CONFIRM: {}
            },
            ADD: {
                INVOKE: {},
                CANCEL: {},
                CONFIRM: {}
            },
        },
        EVENT2: {
            EDIT: {
                INVOKE: {},
                CANCEL: {},
                CONFIRM: {}
            },
            DELETE: {
                INVOKE: {},
                CANCEL: {},
                CONFIRM: {}
            },
        }
    },
    // 注册事件函数
    on(eventType, cb = () => {
    }) {
        Bus.$on(eventType.toString(), (...args) => {
            cb(...args);
        });
    },
    // 触发事件函数
    emit(eventType, data) {
        Bus.$emit(eventType.toString(), data);
    },
    // 销毁注册事件函数
    off(eventType) {
        Bus.$off(eventType.toString());
    },
    // 注册事件触发一次后销毁函数
    once(eventType, cb = () => {
    }) {
        Bus.$on(eventType.toString(), (...args) => {
            cb(...args);
            eventBus.off(eventType.toString());
        });
    }
};

(function (typeRoot) {
    /**
     * @param {*} source 要给每个节点添加链的对象
     * @param {*} parentNode 当前节点的链 比如 EVENT1.EDIT.CANCEL
     */
    function addNodeChain(source, parentNode = 'TYPES') {
        const isObj = typeof source === 'object';
        if (!isObj) return; // 支持传入默认的字符串方式
        const separator = !!parentNode ? '.' : '';
        const isObjEmpty = Object.keys(source).length === 0;
        if (isObjEmpty) {
            source['nodeChain'] = parentNode;
            source.toString = function () {
                return parentNode;
            }
            return;
        }
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                source['nodeChain'] = parentNode;
                source.toString = function () {
                    return parentNode;
                }
                const nodeChain = parentNode + separator + key;
                addNodeChain(source[key], nodeChain);
            }
        }
    }

    addNodeChain(typeRoot);
    Object.freeze(eventBus);
    window.eventBus = eventBus;
})(eventBus.TYPES);

export default eventBus;
