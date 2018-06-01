import Vue from 'vue'
import Router from 'vue-router'
import { Root } from '@/pages'
import { routes } from '@/config/router.config'

Vue.use(Router)

const router = new Router({
    base: 'mywork/index.html',
    mode: 'history',
    component: Root,
    routes
})

export default router
