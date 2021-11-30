import { createApp } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faBarcode, faPlus, faCheck, faFileExport,
} from '@fortawesome/free-solid-svg-icons';
import App from './App.vue';
import router from './router';
import store from './store';
import installElementPlus from './plugins/element';

/* add icons to the library */
library.add(faBarcode, faPlus, faCheck, faFileExport);

const app = createApp(App);
installElementPlus(app);

// app.use(store).use(router).provide('socket', socket).mount('#app');
app.use(store).use(router).component('fa', FontAwesomeIcon).mount('#app');
