import axios from 'axios'

console.log('当前环境', process.env.NODE_ENV)
// 网络请求错误的默认提示
const NETWORK_ERROR = '网络请求异常，请稍后重试....'
// 接口Api请求基准地址
// const baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api/' : 'https://mock.apifox.cn/m1/2100083-0-default/'
const baseURL = process.env.NODE_ENV === 'development' ? 'https://mock.apifox.cn/m1/2100083-0-default/' : 'https://mock.apifox.cn/m1/2100083-0-default/'

const request = axios.create({
  baseURL,
  timeout: 5000
})

// 添加请求拦截器
// request.interceptors.request.use(config => { })

// 添加响应拦截器
request.interceptors.response.use(response => {
  if (response.status === 200) {
    if (response.data.code === 200) {
      return response.data.result
    } else {
      Promise.reject(response.data.message)
    }
  } else {
    Promise.reject(NETWORK_ERROR)
  }
})

export default (option) => {
  const requestOption = {
    url: option.url,
    method: option.method,
    // [] 设置一个动态的key, 写js表达式，js表达式的执行结果当作KEY => ['params']:submitData ===== params:submitData
    [option.method.toLowerCase() === 'get' ? 'params' : 'data']: option.data
  }
  return request(requestOption)
}
