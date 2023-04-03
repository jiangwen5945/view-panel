<template>
  <div class="com-container">
    <div class="com-chart" id="myEcharts" ref="refChart"></div>
  </div>
</template>

<script setup name="comSeller">
import api from '@/api'
import { onMounted, onUnmounted, reactive, getCurrentInstance, markRaw, ref, defineExpose, computed, watch } from 'vue'
import { useStore } from 'vuex'
const { proxy } = getCurrentInstance()
const refChart = ref('')
const store = useStore()

// 获取当前主题
const theme = computed(() => {
  return store.state.theme
})

// 监听主题变化
watch(theme, (oldValue, newValue) => {
  data.chartInstance.dispose()
  initChart()
  screenAdapter()
})

const data = reactive({
  chartInstance: null,
  option: null,
  timerId: null
})
const page = reactive({
  currentPage: 1,
  totalPage: 0
})

// 初始化echart
const initChart = async () => {
  data.chartInstance = markRaw(proxy.$echarts.init(refChart.value, theme.value)) // markRaw => 转为普通对象
  // 初始化配置
  const initOption = {
    title: {
      text: '▍商家销售统计',
      top: 20,
      left: 20
    },
    grid: {
      top: '20%',
      left: '3%',
      right: '6%',
      botton: '3%',
      containLabel: true // 包含坐标轴文字
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        z: 0
      }
    },
    series: [
      {
        type: 'bar',
        label: {
          show: true,
          position: 'right',
          color: '#fff'
        },
        itemStyle: {
          color: new proxy.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
            {
              offset: 0,
              color: '#5052EE'
            },
            {
              offset: 1,
              color: '#Ab6EE5'
            }
          ])
        }
      }
    ]
  }
  data.chartInstance.setOption(initOption)
  getData(data.chartInstance)
  screenAdapter()
  // 监听鼠标移入
  data.chartInstance.on('mouseover', () => clearInterval(data.timerId))
  // 监听鼠标移出
  data.chartInstance.on('mouseout', () => startInterval())
}

// 获取数据
const getData = async () => {
  data.option = await api.getSeller()
  data.option.sort((a, b) => a.value - b.value)
  page.totalPage = data.option.length % 5 === 0 ? data.option.length / 5 : data.option.length / 5 + 1
  updateChart()
}

// 渲染数据
const updateChart = () => {
  const start = (page.currentPage - 1) * 5
  const end = page.currentPage * 5
  const showData = data.option.slice(start, end)
  const dataOption = {
    yAxis: {
      data: showData.map(v => v.name)
    },
    series: [
      {
        data: showData.map(v => v.value)
      }
    ]
  }
  data.chartInstance.setOption(dataOption)
}

// 开始定时器
const startInterval = () => {
  if (data.timerId) {
    clearInterval(data.timerId)
  }
  data.timerId = setInterval(() => {
    page.currentPage++
    if (page.currentPage > page.totalPage) {
      page.currentPage = 1
    }
    updateChart()
  }, 3000)
}

// 屏幕适配
const screenAdapter = () => {
  const titleFontSize = refChart.value.offsetWidth / 100 * 3.6
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize
      }
    },
    series: [
      {
        barWidth: titleFontSize,
        itemStyle: {
          borderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
        }
      }
    ]
  }
  data.chartInstance.setOption(adapterOption)
  data.chartInstance.resize()
}

// 挂载实例
onMounted(() => {
  initChart()
  window.addEventListener('resize', screenAdapter)
  startInterval()
})

// 卸载实例
onUnmounted(() => {
  window.removeEventListener('resize', screenAdapter)
  clearInterval(data.timerId)
})

// 对外暴露方法
defineExpose({
  screenAdapter
})
</script>

<style lang="less" scoped>
</style>
