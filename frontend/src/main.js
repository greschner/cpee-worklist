import { createApp } from 'vue';
import axios from 'axios';
import https from 'https';
import App from './App.vue';
import router from './router';
import store from './store';
import installElementPlus from './plugins/element';

// import socket from './socket';

// allow self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// set as global setting
axios.defaults.httpsAgent = httpsAgent;

const app = createApp(App);
installElementPlus(app);
// app.use(store).use(router).provide('socket', socket).mount('#app');
app.use(store).use(router).mount('#app');
