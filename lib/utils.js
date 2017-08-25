import _ from 'lodash'

export function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms || 1000))
}

export function fakeDistribution () {
  return _.sample([
    'www.meizu.com',
    'www.mi.com',
    'www.vivo.com',
    'www.huawei.com',
    'www.samsung.com'
  ])
}
