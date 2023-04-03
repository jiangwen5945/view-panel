export default class SocketService {
  /**
   * 单例模式
   **/
  static instance = null
  static get Instance () {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  // 存储回调函数
  callBacMapping = {}

  // 回调函数的注册(存储数据到callBacMapping)
  registerCallBack (socketType, callBack) {
    this.callBacMapping[socketType] = callBack
  }

  // 取消回调函数注册
  unRegisterCallBack (socketType) {
    this.callBacMapping[socketType] = null
  }

  // 服务端连接实例对象
  ws = null

  isConnect = false
  trySendCount = 0
  tryConnectCount = 0
  // 连接服务器方法
  connect () {
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket')
    }
    this.ws = new WebSocket('ws://localhost:9998')
    // 连接成功事件
    this.ws.onopen = () => {
      console.log('连接服务器成功')
      this.isConnect = true
      this.tryConnectCount = 0
    }
    // 连接失败事件
    this.ws.onclose = () => {
      console.log('连接服务器失败,正在尝试重连...', this.tryConnectCount)
      this.isConnect = false
      this.tryConnectCount++
      setTimeout(() => {
        this.connect()
      }, 500 * this.tryConnectCount)
    }
    // 接收服务端响应的数据
    this.ws.onmessage = msg => {
      console.log('服务端响应的数据：', msg)
      const { socketType, action } = JSON.parse(msg.data)
      // 判断回调函数是否存在
      if (this.callBacMapping[socketType]) {
        if (action === 'getData') {
          const resData = JSON.parse(msg.data)
          const chartData = JSON.parse(resData.data)
          this.callBacMapping[socketType].call(this, chartData)
        } else if (action === 'fullScreen') {
          this.callBacMapping[socketType].call(this, JSON.parse(msg.data))
        } else if (action === 'themeChange') {
          this.callBacMapping[socketType].call(this, JSON.parse(msg.data))
        }
      }
    }
  }

  // 发送数据到服务器
  send (data) {
    if (this.isConnect) {
      this.trySendCount = 0
      this.ws.send(JSON.stringify(data))
    } else {
      this.trySendCount++
      console.log('发送数据失败,重新发送...', this.trySendCount)
      setTimeout(() => {
        this.send(data)
      }, 500 * this.trySendCount)
    }
  }
}
