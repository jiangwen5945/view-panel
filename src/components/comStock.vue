<template>
  <div class="com-container">
    <div class="com-chart" ref="refChart" id="myEcharts"></div>
  </div>
</template>

<script setup name="comStock">
import api from '@/api'
import { getCurrentInstance, onMounted, reactive, onUnmounted, markRaw, ref, defineExpose, computed, watch } from 'vue'
import { useStore } from 'vuex'

const { proxy } = getCurrentInstance()
const data = reactive({
  store: null,
  chartInstance: null,
  timerId: null,
  currentIndex: 0
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
      text: '▍库存销量分析',
      top: 20,
      left: 20
    },
    grid: {
      top: '40%',
      left: '5%',
      right: '5%',
      botton: '5%',
      containLabel: true // 包含坐标轴文字
    }
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
  data.store = await api.getStock()
  updateChart()
}

// 更新表格
const updateChart = () => {
  // const legendArr = data.store[data.currentIndex].children.map(v => v.name)
  // 圆环坐标
  const centerArr = [
    ['18%', '40%'],
    ['50%', '40%'],
    ['82%', '40%'],
    ['34%', '75%'],
    ['66%', '75%']
  ]
  // 圆环渐变色
  const colorArr = [
    ['#4FF778', '#0BA82C'],
    ['#E5DD45', '#E8B11C'],
    ['#E8821C', '#E55445'],
    ['#5052EE', '#AB6EE5'],
    ['#23E5E5', '#2E72BF']
  ]
  const start = data.currentIndex * 5
  const end = (data.currentIndex + 1) * 5
  const showData = data.store.slice(start, end)
  const seriesArr = showData.map((v, index) => {
    return {
      type: 'pie',
      center: centerArr[index],
      label: {
        show: true,
        position: 'center',
        color: colorArr[index][0]
      },
      emphasis: {
        scale: false
      },
      labelLine: {
        show: false
      },
      data: [
        {
          name: v.name + '\n\n' + v.sales,
          value: v.stock,
          itemStyle: {
            color: '#333843'
          }
        },
        {
          value: v.sales,
          itemStyle: {
            color: new proxy.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorArr[index][0] },
              { offset: 1, color: colorArr[index][1] }
            ])
          }
        }
      ]
    }
  })
  const dataOption = { series: seriesArr }
  data.chartInstance.setOption(dataOption)
}

// 屏幕适配
const refChart = ref('')
const screenAdapter = () => {
  const titleFontSize = refChart.value.offsetWidth / 100 * 3.6
  const innerRadius = titleFontSize * 2.8
  const outterRadius = innerRadius * 1.125
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize
      }
    },
    series: [
      {
        type: 'pie',
        radius: [outterRadius, innerRadius],
        label: {
          fontSize: titleFontSize / 2
        }
      },
      {
        type: 'pie',
        radius: [outterRadius, innerRadius],
        label: {
          fontSize: titleFontSize / 2
        }
      },
      {
        type: 'pie',
        radius: [outterRadius, innerRadius],
        label: {
          fontSize: titleFontSize / 2
        }
      },
      {
        type: 'pie',
        radius: [outterRadius, innerRadius],
        label: {
          fontSize: titleFontSize / 2
        }
      },
      {
        type: 'pie',
        radius: [outterRadius, innerRadius],
        label: {
          fontSize: titleFontSize / 2
        }
      }
    ]
  }
  data.chartInstance.setOption(adapterOption)
  data.chartInstance.resize()
}

// 图表轮播
const startInterval = () => {
  if (data.timerId) {
    clearInterval(data.timerId)
  }
  data.timerId = setInterval(() => {
    data.currentIndex++
    if (data.currentIndex > data.store.length / 5 - 1) {
      data.currentIndex = 0
    }
    updateChart()
  }, 5000)
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
