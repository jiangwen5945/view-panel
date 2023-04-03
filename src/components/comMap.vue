<template>
  <div class="com-container">
    <div class="com-chart" ref="refChart" id="myEcharts" @dblclick="revertMap"></div>
  </div>
</template>

<script setup name="comMap">
import api from '@/api'
import axios from 'axios'
import chinaMap from '../assets/json/china.json'
import { onMounted, onUnmounted, ref, reactive, getCurrentInstance, markRaw, defineExpose, computed, watch } from 'vue'
import { getProvinceMapInfo } from '../utils/map_utils'
import { useStore } from 'vuex'

const refChart = ref('')
const { proxy } = getCurrentInstance()
const data = reactive({
  chartInstance: null,
  store: null,
  titleFontSize: 0,
  mapCache: {}
})

// 获取当前主题
const store = useStore()
const theme = computed(() => {
  return store.state.theme
})

// 监听主题变化
watch(theme, (oldValue, newValue) => {
  data.chartInstance.dispose()
  initChart()
  screenAdapter()
})

// 初始化echart
const initChart = async () => {
  // 注册地图
  // const chinaMap2 = await axios.get('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
  // const chinaMap = await api.getChinaMap()
  proxy.$echarts.registerMap('china', chinaMap)
  // 初始化对象
  data.chartInstance = markRaw(proxy.$echarts.init(refChart.value, theme.value))
  // 初始化配置
  const initOption = {
    title: {
      text: '▍商家分布',
      top: 20,
      left: 20
    },
    geo: {
      type: 'map',
      map: 'china',
      top: '5%',
      bottom: '5%',
      roam: false, // 是否可拖动缩放
      itemStyle: {
        areaColor: '#2E72BF',
        borderColor: '#333'
      }
    },
    legend: {
      left: '5%',
      bottom: '5%',
      orient: 'vertical'
    }
  }
  data.chartInstance.setOption(initOption)
  // 监听地图点击
  data.chartInstance.on('click', async (e) => {
    const provinceInfo = getProvinceMapInfo(e.name)
    console.log('监听地图点击', provinceInfo)
    // 如果没有省份信息,则退出事件(避免省份内点击报错)
    if (!provinceInfo.key) return false
    // 如果不存在该省的缓存,则请求数据
    if (!data.mapCache[provinceInfo.key]) {
      // const provinceMap = await api.getProvinceMap(provinceInfo.path)
      const provinceMap = await axios.get(provinceInfo.path)
      data.mapCache[provinceInfo.key] = provinceMap.data // 保存到缓存
      proxy.$echarts.registerMap(provinceInfo.key, provinceMap.data)
    }
    const changeOption = {
      geo: {
        map: provinceInfo.key,
        label: {
          show: true
        }
      }
    }
    data.chartInstance.setOption(changeOption)
  })
  // 初始化触发屏幕适配
  screenAdapter()
}

// 获取数据
const getData = async () => {
  data.store = await api.getMap()
  updateChart()
}
// 更新图表
const updateChart = () => {
  const legendArr = data.store.map(v => v.name)
  const seriesArr = data.store.map(v => {
    return {
      type: 'effectScatter',
      rippleEffect: { // 涟漪效果设置
        scale: 5,
        brushType: 'stroke'
      },
      name: v.name,
      data: v.children,
      coordinateSystem: 'geo'
    }
  })
  const dataOption = {
    series: seriesArr,
    legend: {
      data: legendArr
    }
  }
  data.chartInstance.setOption(dataOption)
}
// 屏幕适配
const screenAdapter = () => {
  data.titleFontSize = refChart.value.offsetWidth / 100 * 3.6
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: data.titleFontSize
      }
    },
    legend: {
      itemWidth: data.titleFontSize / 2,
      itemHeight: data.titleFontSize / 2,
      itemGap: data.titleFontSize / 2,
      textStyle: {
        fontSize: data.titleFontSize / 3
      }
    }
  }
  data.chartInstance.setOption(adapterOption)
  data.chartInstance.resize()
}

// 回到主地图
const revertMap = () => {
  const revertOption = {
    geo: {
      map: 'china',
      label: {
        show: false
      }
    }
  }
  data.chartInstance.setOption(revertOption)
}

onMounted(() => {
  initChart()
  getData()
  window.addEventListener('resize', screenAdapter)
})
onUnmounted(() => {
  window.removeEventListener('resize', screenAdapter)
})

// 对外暴露方法
defineExpose({
  screenAdapter
})
</script>

<style lang="less" scoped>
</style>
