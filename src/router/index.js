import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'three-demo',
      component: require('@/components/Scene/Scene.vue').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
