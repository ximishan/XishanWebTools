/**
 * 微信广告位统一配置。
 *
 * 默认全部关闭，不使用测试 ID，也不会渲染占位广告。
 * 开通微信流量主并创建广告位后：
 * 1. 把 masterEnabled 改为 true；
 * 2. 填写对应广告位的 unitId；
 * 3. 把该广告位 enabled 改为 true。
 */
const AD_CONFIG = {
  masterEnabled: false,
  slots: {
    homeBanner: {
      enabled: false,
      unitId: '',
      type: 'banner',
      theme: 'white',
      intervals: 60
    },
    lineArtBanner: {
      enabled: false,
      unitId: '',
      type: 'banner',
      theme: 'white',
      intervals: 60
    },
    // 仅预留配置，当前版本不会用广告限制基础保存功能。
    rewardedOptionalFeature: {
      enabled: false,
      unitId: '',
      type: 'rewarded-video'
    },
    interstitialAfterTask: {
      enabled: false,
      unitId: '',
      type: 'interstitial'
    }
  }
}

function getAdSlot(name) {
  const slot = AD_CONFIG.slots[name]
  if (!slot) {
    return {
      enabled: false,
      unitId: '',
      type: 'banner',
      theme: 'white',
      intervals: 60
    }
  }

  const hasUnitId = typeof slot.unitId === 'string' && /^adunit-[a-z0-9]+$/i.test(slot.unitId)
  return {
    ...slot,
    enabled: Boolean(AD_CONFIG.masterEnabled && slot.enabled && hasUnitId)
  }
}

module.exports = {
  AD_CONFIG,
  getAdSlot
}
