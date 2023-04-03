import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/global.less'
import * as echarts from 'echarts'
import './assets/lib/theme/shine' // 引入主题
// import SocketService from '@/utils/socket_service'
// import './assets/lib/theme/chalk'
// import './assets/lib/theme/westeros'

// 连接wss服务端
// SocketService.Instance.connect()
const app = createApp(App)
// vue3 给原型上挂载属性
app.config.globalProperties.$echarts = echarts
// app.config.globalProperties.$socket = SocketService.Instance

app.use(store).use(router).mount('#app')
