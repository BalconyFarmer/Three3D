// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// https://juejin.im/post/6844903937745616910
import Vue from 'vue'
import App from './App'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import axios from 'axios';
import Vuex from 'vuex'
import cookies from 'vue-cookies'
import VuexPersistence from "vuex-persist";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueAMap from "vue-amap";

Vue.config.productionTip = false
Vue.use(Antd)
Vue.use(Vuex)
Vue.prototype.$axios = axios
Vue.use(cookies)
Vue.use(ElementUI);
Vue.use(VueAMap);

// 先创建一个对象并进行配置
const vuexPersist = new VuexPersistence({
    strictMode: true,
    storage: window.localStorage, // 存入localStorage
    reducer: state => ({
        count: state.count,       // 这个就是存入localStorage的值
        userInf: state.userInf,
    })
});

const store = new Vuex.Store({
    state: {
        count: 0,
        userInf: {},
        list: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    mutations: {
        increment(state) {
            state.count++
        },
        // 保存用户信息
        setUserInf(state, userInf) {
            state.userInf = userInf
        },
        // 删除用户信息
        clearUserInf(state) {
            state.userInf = null
        },
        ///
        RESTORE_MUTATION: vuexPersist.RESTORE_MUTATION, // this mutation **MUST** be named "RESTORE_MUTATION"
        setQuery(state, query) {
            state.query = query;
        }

    },
    getters: { //  这个主要是对状态的处理，相当于把状态处理的方法抽成公共部分来管理了
        modifyArr(state) { // 一般化getter
            return state.list.filter((item, index, arr) => {
                return item % 2 == 0;
            })
        },
        getLength(state, getter) { // 方法里面传getter，调用modifyArr来计算长度
            return getter.modifyArr.length;
        }
    },

    plugins: [vuexPersist.plugin]
})

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    cookies,
    components: {App},
    template: '<App/>'
})

VueAMap.initAMapApiLoader({
    key: 'b45d59c7d49f2c8d460c55f6e90f2d22',
    plugin: ['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor', 'AMap.DistrictLayer', 'AMap.DistrictSearch', 'AMap.Lights'],
    // 默认高德 sdk 版本为 1.4.4
    v: '1.4.4'
});

window.addEventListener('load', function () {


})

