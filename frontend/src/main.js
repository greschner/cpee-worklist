import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import installElementPlus from './plugins/element';
// import socket from './socket';

const app = createApp(App);
installElementPlus(app);
// app.use(store).use(router).provide('socket', socket).mount('#app');
app.use(store).use(router).mount('#app');
