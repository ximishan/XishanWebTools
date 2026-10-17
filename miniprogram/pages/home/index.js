const { tools } = require('../../utils/tools')
const { getAdSlot } = require('../../config/ads')

Page({
  data: {
    tools: tools.filter((tool) => tool.enabled),
    homeAd: getAdSlot('homeBanner')
  },

  openTool(event) {
    const { path } = event.currentTarget.dataset
    if (!path) return
    wx.navigateTo({ url: path })
  }
})
