<template>
  <div class="com-container">
    <div class="com-chart" ref="refChart" id="myEcharts">
    </div>
  </div>
</template>

<script setup name="comRank">
import api from '@/api'
import { getCurrentInstance, onMounted, reactive, onUnmounted, markRaw, ref, defineExpose, computed, watch } from 'vue'
import { useStore } from 'vuex'

const { proxy } = getCurrentInstance()
const data = reactive({
  store: null,
  chartInstance: null,
  timerId: null,
  startIndex: 0,
  endIndex: 9
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

// 初始化表格
const initChart = () => {
  data.chartInstance = markRaw(proxy.$echarts.init(refChart.value, theme.value))
  // 初始化配置
  const initOption = {
    title: {
      text: '▍地区销售排行',
      top: 20,
      left: 20
    },
    grid: {
      top: '40%',
      left: '5%',
      right: '5%',
      botton: '5%',
      containLabel: true // 包含坐标轴文字
    },
    tooltip: {
      show: true
    },
    xAxis: {
      type: 'category'
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'bar'
      }
    ]
  }
  data.chartInstance.setOption(initOption)
  // 监听鼠标移入/移出
  data.chartInstance.on('mouseover', () => clearInterval(data.timerId))
  data.chartInstance.on('mouseout', () => startInterval())
  // 屏幕适配
  screenAdapter()
}

// 获取数据
const getData = async () => {
  data.store = await api.getRank()
  data.store.sort((a, b) => b.value - a.value)
  updateChart()
}

// 渲染数据
const updateChart = () => {
  const provinceArr = data.store.map(v => v.name)
  const valueArr = data.store.map(v => v.value)
  // 渐变色数组
  const colorArr = [
    ['#5052EE', '#AB6EE5'],
    ['#2E72BF', '#23E5E5'],
    ['#0BA82C', '#4FF778']
  ]
  const dataOption = {
    xAxis: {
      data: provinceArr
    },
    series: [
      {
        data: valueArr,
        itemStyle: {
          color: e => {
            let targetColorArr = null

            switch (true) {
              case e.value > 300: targetColorArr = colorArr[0]
                break
              case e.value > 200: targetColorArr = colorArr[1]
                break
              default: targetColorArr = colorArr[2]
                break
            }
            return new proxy.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              // 0%
              { offset: 0, color: targetColorArr[0] },
              // 100%
              { offset: 1, color: targetColorArr[1] }
            ])
          }
        }
      }
    ],
    dataZoom: {
      show: false,
      startValue: data.startIndex,
      endValue: data.endIndex
    }
  }
  data.chartInstance.setOption(dataOption)
}

// 启动数据平移定时器
const startInterval = () => {
  if (data.timerId) {
    clearInterval(data.timerId)
  }
  data.timerId = setInterval(() => {
    data.startIndex++
    data.endIndex++
    if (data.endIndex > data.store.length - 1) {
      data.startIndex = 0
      data.endIndex = 9
    }
    updateChart()
  }, 2000)
}

// 屏幕适配
const refChart = ref('')
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
          borderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
        }
      }
    ]
  }
  data.chartInstance.setOption(adapterOption)
  data.chartInstance.resize()
}

onMounted(() => {
  initChart()
  getData()
  window.addEventListener('resize', screenAdapter)
  startInterval()
})
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
