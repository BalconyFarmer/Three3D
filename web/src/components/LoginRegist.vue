<template>
    <div id="all">
        <div>
            <img src="../assets/loginBackground.jpg">
        </div>

        <div class="goHomeLogo">
            <a href="#/">Behance</a>
        </div>

        <div class="form">
            <div class="formIner">
                <p>Sign in</p>
                <p>New user? <a>Create an account</a></p>
                <a-input placeholder="请输入用户名" v-model="name"/>
                <template>
                    <a-input-password placeholder="请输入密码" v-model="password"/>
                </template>
                <a-button type="primary" @click="login">
                    login
                </a-button>
                <a-button type="primary" @click="signUp">
                    sign up
                </a-button>
                <div class="explain">
                    <p>
                        Protected by reCAPTCHA and subject to the Google Privacy Policy and Terms of Service.
                    </p>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import {signUpApi} from '@/api/api'
import {loginApi} from '@/api/api'

export default {
    name: 'LoginRegist',
    data() {
        return {
            name: '',
            password: ''
        }
    },
    methods: {

        login() {
            if (this.name && this.password) {
                const params = {
                    name: this.name,
                    password: this.password
                }
                loginApi(params).then(response => {
                    this.openNotification('登陆成功,' + response.data.name)
                    this.$store.commit('setUserInf', response.data)
                    this.$router.push({path: '/'})
                })
            } else {
                this.openNotification('账户密码不能为空')
            }
        },

        signUp() {
            if (this.name && this.password) {
                const params = {
                    name: this.name,
                    password: this.password
                }
                signUpApi(params).then(response => {
                    this.openNotification(response.data)
                })
            } else {
                this.openNotification('账户密码不能为空')
            }
        },

        // 提示框
        openNotification(response) {
            this.$notification.open({
                message: 'Notification Title',
                description: response.toString(),
                onClick: () => {
                    console.log('Notification Clicked!');
                },
                duration: 2
            });
        }
    }
}
</script>

<style scoped lang="less">
#all {
    // 关闭滚动条
    overflow-y: hidden;
    overflow-x: hidden;

    // 背景图片
    img {
        z-index: -11;
        position: fixed;
        -webkit-filter: blur(2px); //照片滤镜 模糊
        transform: scale(3); // 放大图片
        height: auto; // 响应式调整大小
    }

    // go home logo
    .goHomeLogo {
        margin-left: 488px;
        margin-top: 440px;
        z-index: 100;

        a {
            font-size: 50px;
            color: white;
        }
    }

    // form
    .form {
        position: absolute;
        left: 970px;
        top: 158px;
        width: 510px;
        height: 633px;
        background-color: white;
        border-radius: 5px;

        .formIner {
            margin-left: 60px;
            margin-right: 60px;
            margin-top: 60px;
            margin-bottom: 60px;
            width: 400px;

            .explain {
                margin-top: 25px;
            }
        }
    }
}
</style>
