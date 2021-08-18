import axios from 'axios';
import {serverAdress} from '@/config';

/**
 * 保存场景
 */

export function saveScene(content) {
    return axios({
        method: "post",
        url: serverAdress + '/saveScene',
        data: {
            name: '测试scene数据',
            sceneData: content,
        },
        withCredentials: true
    })
}

export function readScene() {
    return axios({
        method: "post",
        url: serverAdress + '/readScene',
        data: {
            name: '测试scene数据',
        },
        withCredentials: true
    })
}

/**
 * 注册
 */
export function signUpApi(params) {
    return axios({
        method: "post",
        url: serverAdress + '/regist',
        data: {
            name: params.name,
            password: params.password
        },
        withCredentials: true
    })
}

/**
 * 登陆
 */
export function loginApi(params) {
    return axios({
        method: "post",
        url: serverAdress + '/login',
        data: {
            name: params.name,
            password: params.password
        },
        withCredentials: true
    })
}

export function saveVideo(formData) {
    return axios({
        method: "post",
        url: serverAdress + '/saveVideo',
        data: formData,
        withCredentials: true
    })
}

/**
 * 获取微博图片文字
 */
export function getPicList() {
    return axios({
        method: "post",
        url: serverAdress + '/getAllWeibo',
        data: {},
        withCredentials: true
    })
}

/**
 * 保存微博图片文字
 * @param params
 * @returns {AxiosPromise}
 */
export function savePicListApi(params) {
    return axios({
        method: "post",
        url: serverAdress + '/savePicText',
        data: {
            msg: params.msg,
            picName: params.picName,
            userInf: params.userInf,
            projectStr: params.projectStr
        },
        withCredentials: true
    })
}

/**
 * 加载用户头像
 */
export function loadHeadIconApi(params) {
    return axios({
        method: "post",
        url: serverAdress + '/userIcon',
        data: {
            userInf: params.userInf
        },
        withCredentials: true
    })
}

/**
 * 保存3D模型
 */
export function save3DModelApi(formData) {
    return axios({
        method: "post",
        url: serverAdress + '/saveOBJ',
        data: formData,
        withCredentials: true
    })
}

/**
 * 获取obj列表
 */
export function getOBJList(formData) {
    return axios({
        method: "post",
        url: serverAdress + '/getOBJList',
        data: formData,
        withCredentials: true
    })
}

