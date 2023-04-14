<template>
  <div class="screen-container" :style="containerStyle" ref="refPanel">
    <header class="screen-header">
      <div>
        <img v-show="theme === 'dark'" src="~@/assets/images/header_border_dark.png" alt="" />
        <img v-show="theme !== 'dark'" src="~@/assets/images/header_border_light.png" alt="" />
      </div>
      <span class="logo">
        <img src="../assets/images/logo.png"  alt="logo">
        瞎猫商城
      </span>
      <span class="title" :style="titleStyle">电商平台实时监控系统</span>
      <div class="title-right">
        <img v-show="theme === 'dark'" src="~@/assets/images/qiehuan_dark.png" class="qiehuan" @click="handleChangeTheme" alt="切换主题" title="切换主题" />
        <img v-show="theme !== 'dark'" src="~@/assets/images/qiehuan_light.png" class="qiehuan" @click="handleChangeTheme" alt="切换主题" title="切换主题" />
        <div class="datetime"> {{ data.systemDateTime }} </div>
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top" :class="{ fullscreen: fullScreenStatus.trend }">
          <!-- 销量趋势图表 -->
          <Trend :ref="refs.trend"></Trend>
          <div class="resize">
            <span @click="changeSize('trend')" :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="left-bottom" :class="{ fullscreen: fullScreenStatus.seller }">
          <!-- 商家销售金额图表 -->
          <Seller :ref="refs.seller"></Seller>
          <div class="resize">
            <span @click="changeSize('seller')" :class="['iconfont', fullScreenStatus.seller ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top" :class="{ fullscreen: fullScreenStatus.map }">
          <!-- 商家分布图表 -->
          <Map :ref="refs.map"></Map>
          <div class="resize">
            <span @click="changeSize('map')" :class="['iconfont', fullScreenStatus.map ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="middle-bottom" :class="{ fullscreen: fullScreenStatus.rank }">
          <!-- 地区销量排行图表 -->
          <Rank :ref="refs.rank"></Rank>
          <div class="resize">
            <span @click="changeSize('rank')" :class="['iconfont', fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top" :class="{ fullscreen: fullScreenStatus.hot }">
          <!-- 热销商品占比图表 -->
          <Hot :ref="refs.hot"></Hot>
          <div class="resize">
            <span @click="changeSize('hot')" :class="['iconfont', fullScreenStatus.hot ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="right-bottom" :class="{ fullscreen: fullScreenStatus.stock }">
          <!-- 库存销量分析图表 -->
          <Stock :ref="refs.stock"></Stock>
          <div class="resize">
            <span @click="changeSize('stock')" :class="['iconfont', fullScreenStatus.stock ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script  setup name="HomePage">
import Hot from '@/components/comHot.vue'
import Map from '@/components/comMap.vue'
import Rank from '@/components/comRank.vue'
import Seller from '@/components/comSeller.vue'
import Stock from '@/components/comStock.vue'
import Trend from '@/components/comTrend.vue'
import { computed } from '@vue/reactivity'
import { onMounted, onUnmounted, reactive, ref, getCurrentInstance } from 'vue'
// 导入自己定义的主题工具函数 用于返回不同主题下的配置对象
import { getThemeValue } from '../utils/theme_utils'
import { useStore } from 'vuex'

const { proxy } = getCurrentInstance()
const store = useStore()
const data = reactive({
  systemDateTime: null
})

const theme = computed(() => {
  return store.state.theme
})

const refs = {
  trend: ref(null),
  stock: ref(null),
  seller: ref(null),
  rank: ref(null),
  map: ref(null),
  hot: ref(null)
}

const fullScreenStatus = reactive({
  trend: false,
  stock: false,
  seller: false,
  rank: false,
  map: false,
  hot: false
})

// 动态样式
const containerStyle = computed(() => {
  return {
    backgroundColor: getThemeValue(store.state.theme).backgroundColor,
    color: getThemeValue(store.state.theme).titleColor
  }
})

// 当前时间
const currentTime = () => {
  data.systemDateTime = new Date().toLocaleString()
  data.timeId && clearInterval(data.timeId)
  data.timeId = setInterval(() => {
    data.systemDateTime = new Date().toLocaleString()
  }, 1000)
}

// 适配样式
const titleStyle = reactive({
  fontSize: '20px',
  height: '60px'
})
const refPanel = ref(null)
const screenAdapter = () => {
  if (!refPanel.value.offsetWidth) return
  titleStyle.fontSize = refPanel.value.offsetWidth / 100 * 2 + 'px'
  titleStyle.height = refPanel.value.offsetWidth / 100 * 3 + 'px'
}

// 切换全屏
const changeSize = (chartName) => {
  // http方式:
  fullScreenStatus[chartName] = !fullScreenStatus[chartName]
  // nextTick => 当数据发送变化，组件下一次更新的时机
  proxy.$nextTick(() => {
    refs[chartName].value.screenAdapter()
  })
  // WebSocket方式:
  // const targetValue = !fullScreenStatus[chartName]
  // proxy.$socket.send({
  //   action: 'fullScreen',
  //   socketType: 'fullScreen',
  //   chartName: chartName,
  //   value: targetValue
  // })
}

// 切换主题
const handleChangeTheme = () => {
  store.commit('changeTheme')
  // WebSocket方式:
  // proxy.$socket.send({
  //   action: 'themeChange',
  //   socketType: 'themeChange',
  //   chartName: '',
  //   value: ''
  // })
}

// const recvChangeTheme = () => {
//   // WebSocket方式的回调函数：联动修改主题
//   WebSocket方式:
//   console.log('切换主题')
//   store.commit('changeTheme')
// }

// const recvData = (res) => {
//   // WebSocket方式的回调函数：联动修改全屏
//   const chartName = res.chartName
//   const targetValue = res.value
//   fullScreenStatus[chartName] = targetValue
//   proxy.$nextTick(() => {
//     refs[chartName].value.screenAdapter()
//   })
// }

onMounted(() => {
  currentTime()
  screenAdapter()
  window.addEventListener('resize', screenAdapter)
  // WebSocket方式：
  // proxy.$socket.registerCallBack('fullScreen', recvData)
  // proxy.$socket.registerCallBack('themeChange', recvChangeTheme)
})

onUnmounted(() => {
  clearInterval(data.timeId)
  // proxy.$socket.unRegisterCallBack('fullScreen')
  // proxy.$socket.unRegisterCallBack('themeChange')
})
</script>

<style lang="less" scoped>
// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 9999;
}

.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}
.screen-header {
  width: 100%;
  // height: 64px;
  // font-size: 20px;
  position: relative;
  > div {
    img {
      width: 100%;
    }
  }
  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }
  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: inherit;
    margin-left: 10px;
  }
  .logo {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-80%);
    display: flex;
    align-items: center;
    img{
      width: 1.8rem;
      height: 1.8rem;
    }
    a {
      text-decoration: none;
    }
  }
}
.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;
  .screen-left {
    height: 100%;
    width: 27.6%;
    #left-top {
      height: 53%;
      position: relative;
    }
    #left-bottom {
      height: 31%;
      margin-top: 25px;
      position: relative;
    }
  }
  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;
    #middle-top {
      width: 100%;
      height: 56%;
      position: relative;
    }
    #middle-bottom {
      margin-top: 25px;
      width: 100%;
      height: 28%;
      position: relative;
    }
  }
  .screen-right {
    height: 100%;
    width: 27.6%;
    #right-top {
      height: 46%;
      position: relative;
    }
    #right-bottom {
      height: 38%;
      margin-top: 25px;
      position: relative;
    }
  }
}
.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}
</style>
