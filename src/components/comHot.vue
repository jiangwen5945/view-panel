<template>
  <div class="com-container">
    <div class="com-chart" ref="refChart" id="myEcharts"></div>
    <span class="left" @click="toLeft">
      <i class="iconfont  icon-fangxiang-xiangzuo" :style="comStyle"></i>
    </span>
    <span class="right" @click="toRight">
      <i class="iconfont icon-fangxiang-xiangyou"  :style="comStyle"></i>
    </span>
    <div class="cat-name"  :style="comStyle">
      {{ catName }}
    </div>
  </div>
</template>

<script setup name="comHot">
import api from '@/api'
import { getCurrentInstance, onMounted, reactive, onUnmounted, markRaw, ref, computed, defineExpose, watch } from 'vue'
import { useStore } from 'vuex'
import { getThemeValue } from '../utils/theme_utils'

const { proxy } = getCurrentInstance()

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

const comStyle = computed(() => {
  return {
    fontSize: data.titleFontSize / 2 + 'px',
    color: getThemeValue(theme.value).titleColor
  }
})

const data = reactive({
  store: null,
  chartInstance: null,
  currentIndex: 0, // 当前分类
  titleFontSize: 0
})

// 初始化表格
const initChart = () => {
  data.chartInstance = markRaw(proxy.$echarts.init(refChart.value, theme.value))
  // 初始化配置
  const initOption = {
    title: {
      text: '▍热销产品占比',
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
    legend: {
      top: '15%',
      icon: 'circle'
    },
    series: [
      {
        type: 'pie',
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true
          },
          labelLine: {
            show: false
          }
        }
      }
    ]
  }
  data.chartInstance.setOption(initOption)
  // 初始化触发屏幕适配
  screenAdapter()
}

// 获取数据
const getData = async (res) => {
  data.store = await api.getHotProduct()
  // data.store = res
  updateChart()
}

// // 渲染数据
const updateChart = () => {
  const legendArr = data.store[data.currentIndex].children.map(v => v.name)
  const seriesArr = data.store[data.currentIndex].children.map(v => {
    return {
      name: v.name,
      value: v.value,
      children: v.children
    }
  })
  const dataOption = {
    legend: {
      data: legendArr
    },
    series: [
      {
        data: seriesArr
      }
    ],
    tooltip: {
      formatter: arg => {
        const thirdCategory = arg.data.children
        // 计算三级分类数值总和
        let total = 0
        thirdCategory.forEach(e => {
          total += e.value
        })
        // 显示结果
        let resText = ''
        thirdCategory.forEach(e => {
          resText += `${e.name}: ${parseInt(e.value / total * 100)}%<br/>`
        })
        return resText
      }
    }
  }
  data.chartInstance.setOption(dataOption)
}

// 左右切换一级类目
const toLeft = () => {
  data.currentIndex--
  if (data.currentIndex < 0) {
    data.currentIndex = data.store.length - 1
  }
  updateChart()
}

const toRight = () => {
  data.currentIndex++
  if (data.currentIndex > data.store.length - 1) {
    data.currentIndex = 0
  }
  updateChart()
}

// 一级类目名称
const catName = computed(() => {
  // return data.store[data.currentIndex].name
  if (data.store) {
    return data.store[data.currentIndex].name
  } else {
    return ''
  }
})

// 屏幕适配
const refChart = ref('')
const screenAdapter = () => {
  data.titleFontSize = refChart.value.offsetWidth / 100 * 3.6
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: data.titleFontSize
      }
    },
    series: [
      {
        radius: data.titleFontSize * 4.5,
        center: ['50%', '55%']
      }
    ],
    legend: {
      itemWidth: data.titleFontSize / 2,
      itemHeight: data.titleFontSize / 2,
      itemGap: data.titleFontSize / 2,
      textStyle: {
        fontSize: data.titleFontSize / 2
      }
    }
  }
  data.chartInstance.setOption(adapterOption)
  data.chartInstance.resize()
}

onMounted(() => {
  initChart()
  getData()
  window.addEventListener('resize', screenAdapter)
  // 注册回调函数
  // proxy.$socket.registerCallBack('hotData', getData)
  // 发送给后端需要返回类型的数据
  // proxy.$socket.send({
  //   action: 'getData',
  //   socketType: 'hotData',
  //   chartName: 'hotproduct',
  //   value: ''
  // })
})

onUnmounted(() => {
  window.removeEventListener('resize', screenAdapter)
  clearInterval(data.timerId)
  // proxy.$socket.unRegisterCallBack('hotData')
})

// 对外暴露方法
defineExpose({
  screenAdapter
})

</script>

<style lang="less" scoped>
  .left, .right {
    position: absolute;
    color: #fff;
    top: 55%;
    transform: translateY(-50%);
  }
  .left{
    left: 10%;
  }
  .right {
    right: 10%;
  }

  .cat-name {
    position: absolute;
    color: #fff;
    right: 5%;
    bottom: 5%;
  }

</style>
