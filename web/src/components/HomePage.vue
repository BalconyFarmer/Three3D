<template>
    <div class="hello">
        <div id="homeHeader">
            <div id="newMenu">
                <a-menu v-model="current" mode="horizontal" theme="dark">

                    <a-menu-item key="mail3" @click="goExperimentArea">
                        <a-icon type="appstore"/>
                        ExperimentArea
                    </a-menu-item>

                    <a-menu-item key="mail5" @click="goDigitalCity">
                        <a-icon type="appstore"/>
                        DigitalCity
                    </a-menu-item>

                </a-menu>
            </div>
        </div>
        <router-view/>
    </div>
</template>

<script>
import LoginRegist from './LoginRegist'
import {loadHeadIconApi} from '@/api/api'

export default {
    name: 'HomePage',
    components: {
        LoginRegist,
    },
    data() {
        return {
            userInf: this.$store.state.userInf,
            userIconBS64: null,
            showUserDetailFlag: false,
            keepUserDetailFlag: false,
            current: ['mail'],
        }
    },
    computed: {
    },
    methods: {
        routeTo(route) {
            this.$router.push({path: '/' + route}).catch(error => error)
        },

        showUserDetail() {
            this.showUserDetailFlag = true
        },
        hideUserDetail() {
            const self = this
            setTimeout(function () {
                if (!self.keepUserDetailFlag) {
                    self.showUserDetailFlag = false
                }
            }, 100)
        },
        keepUserDetail() {
            this.keepUserDetailFlag = true
        },
        stopKeepDetail() {
            this.keepUserDetailFlag = false
            this.hideUserDetail()
        },
        toPersonalInf() {
            console.log('切换个人资料')
        },
        newProject() {
            this.$router.push({path: '/newProject'}).catch(error => error)
        },
        newMsg() {
            let currentRouter = localStorage.getItem('currentRouter')
            // 如果有缓存路由 -> 缓存路由
            // 没有 -> 默认路由
            if (currentRouter) {
                console.log(currentRouter, '++++++++++++++++++++++++++++++++++++++++++++')
                this.$router.push({path: currentRouter}).catch(error => error)
            } else {
                this.$router.push({path: '/newMsg'}).catch(error => error)
            }

        },

        loadHeadIcon() {
            if (this.userInf) {
                const params = {
                    userInf: this.userInf
                }
                loadHeadIconApi(params).then((response) => {
                    this.userIconBS64 = response.data
                }).catch(error => console.log(error, "error"));
            } else {
                this.userIconBS64 = null
            }
        },
        goHome() {
            this.$router.push({path: '/homeDisplay'}).catch(error => error)
        },
        logOut() {
            // 清楚vuex - > localStorage
            this.$store.commit('clearUserInf')
            // 清除cookie - > session
            const see = this.$cookies.set('USER_SID', null)
            // 清除头像
            this.userInf = null
            this.showUserDetailFlag = false
        },
        goExperimentArea() {
            this.$router.push({path: '/experimentArea'}).catch(error => error)
        },
        goDigitalCity() {
            this.$router.push({path: '/goDigitalCity'}).catch(error => error)
        },

        goVideo() {
            this.$router.push({path: '/goVideo'}).catch(error => error)
        },
        goWangEditor() {
            this.$router.push({path: '/goWangEditor'}).catch(error => error)
        },
    },
    watch: {},
    created() {
    },
    mounted() {
        this.loadHeadIcon()
        this.goDigitalCity()

    },
    beforeDestroy() {
    }
}
</script>

<style scoped lang="less">
.hello {

    width: 100%;
    height: 100%;

    #homeHeader {

        #signInContainer {

            position: absolute;
            top: 6px;
            left: calc(100vw - 80px);
            z-index: 1000;

            .signIn {
                display: inline-block;
                color: gray;
                font-size: large;
                cursor: pointer;
            }

            .signIn:hover {
                color: white;
            }

            .userIconPic {
                width: 32px;
                height: 32px;
                border-radius: 50%;
            }

            .userDetailed {
                position: relative;
                top: 20px;
                left: -268px;
                width: 300px;
                height: 300px;
                border-style: solid;
                border-color: black;
                border-width: 1px;
                //box-shadow: 2px 2px 2px #bfbfbf;
                background-color: #001529;

                .userIconPicDetail {
                    width: 65px;
                    height: 65px;
                    margin-left: 20px;
                    margin-top: 20px;
                    border-radius: 50%;
                }

                .naIdContainer {
                    /*margin-top: 40px;*/
                    margin-left: 10px;
                    display: inline-block;

                    .userName {
                        display: inline-block;
                        color: #ffffff;
                    }

                    .userId {
                        display: inline-block;
                        color: #ffffff;
                    }
                }

                .personalInf {
                    margin-top: 30px;
                }
            }
        }
    }
}

</style>
