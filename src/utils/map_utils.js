const nameChange = {
  安徽: 'anhui',
  陕西: 'shanxi1',
  澳门: 'aomen',
  北京: 'beijing',
  重庆: 'chongqing',
  福建: 'fujian',
  甘肃: 'gansu',
  广东: 'guangdong',
  广西: 'guangxi',
  贵州: 'guizhou',
  海南: 'hainan',
  河北: 'hebei',
  黑龙江: 'heilongjiang',
  河南: 'henan',
  湖北: 'hubei',
  湖南: 'hunan',
  江苏: 'jiangsu',
  江西: 'jiangxi',
  吉林: 'jilin',
  辽宁: 'liaoning',
  内蒙古: 'neimenggu',
  宁夏: 'ningxia',
  青海: 'qinghai',
  山东: 'shandong',
  上海: 'shanghai',
  山西: 'shanxi',
  四川: 'sichuan',
  台湾: 'taiwan',
  天津: 'tianjin',
  香港: 'xianggang',
  新疆: 'xinjiang',
  西藏: 'xizang',
  云南: 'yunnan',
  浙江: 'zhejiang'
}

const adcode = {
  北京: 110000,
  天津: 120000,
  河北: 130000,
  山西: 140000,
  内蒙古: 150000,
  辽宁: 210000,
  吉林: 220000,
  黑龙江: 230000,
  上海: 310000,
  江苏: 320000,
  浙江: 330000,
  安徽: 340000,
  福建: 350000,
  江西: 360000,
  山东: 370000,
  河南: 410000,
  湖北: 420000,
  湖南: 430000,
  广东: 440000,
  广西: 450000,
  海南: 460000,
  重庆: 500000,
  四川: 510000,
  贵州: 520000,
  云南: 530000,
  西藏: 540000,
  陕西: 610000,
  甘肃: 620000,
  青海: 630000,
  宁夏: 640000,
  新疆: 650000,
  台湾: 710000,
  香港: 810000
}

export function getProvinceMapInfo (arg) {
  // const path = `/map/province/${nameChange[arg]}`
  const path = `https://geo.datav.aliyun.com/areas_v3/bound/${adcode[arg]}_full.json`
  return {
    key: nameChange[arg],
    path: path,
    code: adcode[arg]
  }
}
