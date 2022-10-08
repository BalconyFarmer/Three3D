import Vue from 'vue'
import Router from 'vue-router'
import HomePage from '@/components/HomePage'
import ExperimentArea from "../components/ExperimentArea/ExperimentArea";
import DigitalCity from "../components/DigitalCity/DigitalCity";
import MenuD3 from "../components/Menu3d/MenuD3";

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
                {path: 'go3dMenu', component: MenuD3, children: []},
            ]
        }
    ],
    mode: "history", // hash
    base: process.env.NODE_ENV === "development" ? "/test" : "/Three3D",
})

router.beforeEach((to, from, next) => {
    next()
    localStorage.setItem('currentRouter', to.path)
})
export default router
