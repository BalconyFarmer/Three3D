import Vue from 'vue'
import Router from 'vue-router'
import HomePage from '@/components/HomePage'
import ExperimentArea from "../components/ExperimentArea/ExperimentArea";
import DigitalCity from "../components/DigitalCity/DigitalCity";

Vue.use(Router)

const router = new Router({
    routes: [
        {
            path: '/',
            name: 'HomePage',
            component: HomePage,
            children: [
                {path: 'goDigitalCity', component: DigitalCity},
                {path: 'experimentArea', component: ExperimentArea, children: []},
            ]
        }
    ],
    mode: "history", // hash
    base: process.env.NODE_ENV === "development" ? "/test" : "/3DEditor",
})

router.beforeEach((to, from, next) => {
    next()
    localStorage.setItem('currentRouter', to.path)
})
export default router
