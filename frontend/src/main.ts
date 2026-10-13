import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './assets/styles/main.css';
import { authService } from './features/auth/auth.service';

Vue.config.productionTip = false;

// Initialize auth session and mount Vue 2.7 app
authService.init().then(() => {
  new Vue({
    router,
    render: (h) => h(App),
  }).$mount('#app');
});
