import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from "./router/index";
import axios from 'axios';
import VueAxios from 'vue-axios';
import store from './store';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';


import vue3GoogleLogin from 'vue3-google-login';

import UA from './locale/UA.json';
import EN from './locale/EN.json';


import 'primevue/resources/themes/aura-light-green/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import './assets/main.css';

const CLIENT_ID = '670197532532-d26aqn0m834fp1aghoifppk4d4tspbtm.apps.googleusercontent.com';
const app = createApp(App);
const i18n = createI18n({
    locale: "UA",
    messages: {
        UA,EN
    }
});
app.use(store);
app.use(VueAxios, axios);
app.use(router);
app.use(PrimeVue, { ripple: true });
app.use(ToastService);
app.use(vue3GoogleLogin, {
    clientId: CLIENT_ID
});
app.use(i18n);
app.mount('#app');