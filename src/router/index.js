import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Game from '../views/Game.vue';
import About from '../views/About.vue';
import Character from '../views/Character.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/game',
    name: 'Game',
    component: Game,
  },
  {
    path: '/a-propos',
    name: 'About',
    component: About,
  },
  {
    path: '/character',
    name: 'Character',
    component: Character,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router
