<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span @click="data.showSelect=!data.showSelect" >
        ▍{{data.showTitle}}<i class="iconfont icon-xiala"></i>
      </span>
      <div class="select-list" v-show="data.showSelect" :style="currentMarginLeft">
        <div
          class="select-item"
          v-for="item in selectArr"
          :key="item.key"
          @click="handleSelect(item)"
        >
          {{item.text}}
        </div>
      </div>
    </div>

    <div class="com-chart" id="myEcharts" ref="refChart"></div>
  </div>
</template>

<script setup name="comTrend">
import api from '@/api'
import { onMounted, onUnmounted, ref, reactive, getCurrentInstance, computed, markRaw, defineExpose, watch } from 'vue'
import { useStore } from 'vuex'
import { getThemeValue } from '../utils/theme_utils'

const refChart = ref('')
const { proxy } = getCurrentInstance()

const data = reactive({
  chartInstance: null,
  store: null,
  timerId: null,
  showSelect: false,
  activeType: 'map',
  showTitle: '地区销量趋势',
  titleFontSize: 0
})

// 获取当前主题
const store = useStore()
const theme = computed(() => {
  return store.state.theme
})

// 监听主题变化
watch(theme, (oldValue, newValue) => {
  console.log('当前主题改变了', oldValue, newValue)
  data.chartInstance.dispose()
  initChart()
  screenAdapter()
})

// 初始化echart
const initChart = () => {
  // 1.初始化对象
  data.chartInstance = markRaw(proxy.$echarts.init(refChart.value, theme.value))
  // 2.初始化配置
  const initOption = {
    grid: {
      top: '30%',
      left: '3%',
      right: '4%',
      botton: '1%',
      containLabel: true // 包含坐标轴文字
    },
    legend: {
      left: 20,
      top: '18%',
      icon: 'circle'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    }
  }
  data.chartInstance.setOption(initOption)
  screenAdapter()
}

// 获取数据
const getData = async () => {
  data.store = await api.getTrend()
  updateChart()
}

// 渲染数据
const updateChart = () => {
  // 渐变色数组
  const colorArr = [
    ['#0BA82C', '#4FF778'],
    ['#2E72BF', '#23E5E5'],
    ['#5052EE', '#AB6EE5'],
    ['#5052EE', '#AB6EE5'],
    ['#5052EE', '#AB6EE5'],
    ['#5052EE', '#AB6EE5']
  ]
  // 类目轴
  const timeArr = data.store.common.month
  // Y轴数据
  const valueArr = data.store[data.activeType].data
  const seriesArr = valueArr.map((v, index) => {
    return {
      name: v.name,
      type: 'line',
      data: v.data,
      stack: 'map', // 堆叠
      areaStyle: new proxy.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
        // 0%
        { offset: 0, color: colorArr[index][0] },
        // 100%
        { offset: 1, color: colorArr[index][1] }
      ])
    }
  })
  // 图例数据
  const legendArr = valueArr.map(v => v.name)
  // 数据项配置
  const dataOption = {
    xAxis: {
      data: timeArr
    },
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

const currentMarginLeft = computed(() => {
  return {
    marginLeft: data.titleFontSize / 1.5 + 'px'
  }
})

const comStyle = computed(() => {
  return {
    fontSize: data.titleFontSize / 1.1 + 'px',
    color: getThemeValue(theme.value).titleColor,
    background: getThemeValue(theme.value).selectgroundColor
  }
})

// 计算所有可选项
const selectArr = computed(() => {
  if (!data.store) return []
  return data.store.type.filter(v => v.key !== data.activeType)
})

// 处理选中
const handleSelect = (item) => {
  data.activeType = item.key // 设置选中类型
  data.showTitle = item.text // 设置选中名称
  data.showSelect = false // 隐藏下拉选项
  updateChart()
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
  .title {
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 10;
    color: #fff;
    cursor: pointer;
    padding: 10px;
    border-radius: 4px;
    font-weight: bold;
    i{
      font-size: inherit;
    }
    .select-list{
      line-height: 1.5;
    }
  }
</style>
