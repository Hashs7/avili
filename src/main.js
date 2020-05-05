import Vue from 'vue';
import vuexI18n from 'vuex-i18n';
import App from './App.vue';
import router from './router';
import store from './store';
import '@/styles/style.scss'
import translationsFr from '@/lang/fr_FR';
import translationsEn from '@/lang/en_US';

Vue.config.productionTip = false;

Vue.use(vuexI18n.plugin, store);

Vue.i18n.add('fr', translationsFr);
Vue.i18n.add('en', translationsEn);

Vue.i18n.set('fr');

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
