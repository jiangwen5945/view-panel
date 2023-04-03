import request from '../utils/request'

export default {
  getSeller: (params) => {
    return request({
      url: '/seller',
      method: 'get',
      data: params
    })
  },
  getTrend: (params) => {
    return request({
      url: '/trend',
      method: 'get',
      data: params
    })
  },
  getMap: (params) => {
    return request({
      url: '/map',
      method: 'get',
      data: params
    })
  },
  getChinaMap: (params) => {
    return request({
      url: '/map/china',
      method: 'get',
      data: params
    })
  },
  getProvinceMap: (provinceUrl) => {
    return request({
      url: provinceUrl,
      method: 'get',
      data: null
    })
  },
  getRank: (params) => {
    return request({
      url: '/rank',
      method: 'get',
      data: params
    })
  },
  getHotProduct: (params) => {
    return request({
      url: '/hotproduct',
      method: 'get',
      data: params
    })
  },
  getStock: (params) => {
    return request({
      url: '/stock',
      method: 'get',
      data: params
    })
  }
}
