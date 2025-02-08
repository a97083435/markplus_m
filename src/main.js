import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import { createI18n } from 'vue-i18n';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css';
import en from './i18n/en/messages.json'
import zh from './i18n/zh/messages.json'
// import zh from './i18n/zh/messages.yml'

const app = createApp(App);


const browserLocale = navigator.language.split('-')[0]
console.log(browserLocale)
const i18n = createI18n({
    locale: browserLocale == "zh" ? browserLocale : 'en', // 如果支持浏览器语言，则使用，否则使用 'en'
    fallbackLocale: 'en', // 默认回退语言
    messages:{
        en,zh
    }
});
app.use(i18n);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.use(ElementPlus,{ size: 'small' });

app.mount('#app');
