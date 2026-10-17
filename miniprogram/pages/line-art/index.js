const { renderArtwork } = require('../../utils/draw')
const { getAdSlot } = require('../../config/ads')

const RATIO_OPTIONS = [
  { label: '3:4（1080×1440）', value: '3:4', width: 1080, height: 1440 },
  { label: '9:16（1080×1920）', value: '9:16', width: 1080, height: 1920 },
  { label: '1:1（1440×1440）', value: '1:1', width: 1440, height: 1440 },
  { label: '16:9（1920×1080）', value: '16:9', width: 1920, height: 1080 }
]

const BACKGROUND_MODES = [
  { label: '默认渐变', value: 'gradient' },
  { label: '纯色背景', value: 'solid' },
  { label: '透明背景', value: 'transparent' },
  { label: '上传图片', value: 'image' }
]

const FIT_OPTIONS = [
  { label: '铺满裁剪', value: 'cover' },
  { label: '完整显示', value: 'contain' },
  { label: '拉伸铺满', value: 'stretch' }
]

const PRESETS = {
  light: { alpha: 0.68, damage: 0.10, jitter: 3, local: 0.8, zig: 18, vert: 34, circuit: 52, noise: 0.03, blur: 0.2 },
  mid: { alpha: 0.56, damage: 0.20, jitter: 5, local: 1.25, zig: 24, vert: 54, circuit: 72, noise: 0.05, blur: 0.4 },
  strong: { alpha: 0.44, damage: 0.31, jitter: 8, local: 1.75, zig: 31, vert: 78, circuit: 95, noise: 0.09, blur: 0.7 }
}

Page({
  data: {
    text: '分享复制视频链接\n打开迅雷自动跳转',
    ratioOptions: RATIO_OPTIONS,
    ratioIndex: 0,
    ratioLabel: RATIO_OPTIONS[0].label,
    previewHeight: 867,
    backgroundModes: BACKGROUND_MODES,
    backgroundModeIndex: 0,
    backgroundMode: 'gradient',
    backgroundModeLabel: BACKGROUND_MODES[0].label,
    backgroundColor: '#eef8fa',
    colorPresets: ['#eef8fa', '#ffffff', '#f6f0e8', '#edf0ff', '#1d2730'],
    backgroundImagePath: '',
    fitOptions: FIT_OPTIONS,
    fitIndex: 0,
    fitLabel: FIT_OPTIONS[0].label,
    backgroundFit: 'cover',
    backgroundOpacity: 1,
    backgroundBlur: 0,
    backgroundZoom: 1,
    backgroundOffsetX: 0,
    backgroundOffsetY: 0,
    fontSize: 92,
    stroke: 1.8,
    alpha: 0.56,
    damage: 0.20,
    jitter: 5,
    local: 1.25,
    zig: 24,
    vert: 54,
    circuit: 72,
    noise: 0.05,
    blur: 0.4,
    activePreset: 'mid',
    canvasReady: false,
    lineArtAd: getAdSlot('lineArtBanner')
  },

  onReady() {
    const query = wx.createSelectorQuery()
    query.select('#artCanvas')
      .fields({ node: true, size: true })
      .exec((result) => {
        const canvasInfo = result && result[0]
        if (!canvasInfo || !canvasInfo.node) {
          wx.showToast({ title: '画布初始化失败', icon: 'none' })
          return
        }
        this.canvas = canvasInfo.node
        this.ctx = this.canvas.getContext('2d', { alpha: true })
        this.seed = Math.floor(Math.random() * 1000000000)
        this.setData({ canvasReady: true }, () => this.draw())
      })
  },

  onUnload() {
    if (this.drawTimer) clearTimeout(this.drawTimer)
  },

  getOutputSize() {
    return RATIO_OPTIONS[this.data.ratioIndex] || RATIO_OPTIONS[0]
  },

  getSettings() {
    const keys = [
      'text', 'fontSize', 'stroke', 'alpha', 'damage', 'jitter', 'local',
      'zig', 'vert', 'circuit', 'noise', 'blur', 'backgroundMode',
      'backgroundColor', 'backgroundFit', 'backgroundOpacity',
      'backgroundBlur', 'backgroundZoom', 'backgroundOffsetX', 'backgroundOffsetY'
    ]
    return keys.reduce((settings, key) => {
      settings[key] = this.data[key]
      return settings
    }, {})
  },

  createOffscreenCanvas(width, height) {
    return wx.createOffscreenCanvas({
      type: '2d',
      width,
      height
    })
  },

  draw() {
    if (!this.canvas || !this.data.canvasReady) return
    const { width, height } = this.getOutputSize()
    try {
      if (this.canvas.width !== width) this.canvas.width = width
      if (this.canvas.height !== height) this.canvas.height = height
      this.ctx = this.canvas.getContext('2d', { alpha: true })
      renderArtwork({
        canvas: this.canvas,
        ctx: this.ctx,
        width,
        height,
        seed: this.seed,
        settings: this.getSettings(),
        backgroundImage: this.backgroundImage,
        createOffscreenCanvas: (offscreenWidth, offscreenHeight) => (
          this.createOffscreenCanvas(offscreenWidth, offscreenHeight)
        )
      })
    } catch (error) {
      console.error('绘制失败', error)
      wx.showToast({ title: '绘制失败，请降低效果强度', icon: 'none' })
    }
  },

  scheduleDraw(delay) {
    if (this.drawTimer) clearTimeout(this.drawTimer)
    this.drawTimer = setTimeout(() => this.draw(), delay == null ? 100 : delay)
  },

  onTextInput(event) {
    this.setData({ text: event.detail.value, activePreset: '' })
    this.scheduleDraw(180)
  },

  onRatioChange(event) {
    const ratioIndex = Number(event.detail.value)
    const ratio = RATIO_OPTIONS[ratioIndex]
    this.setData({
      ratioIndex,
      ratioLabel: ratio.label,
      previewHeight: Math.round(650 * ratio.height / ratio.width)
    }, () => this.draw())
  },

  onBackgroundModeChange(event) {
    const backgroundModeIndex = Number(event.detail.value)
    const selected = BACKGROUND_MODES[backgroundModeIndex]
    if (selected.value === 'image' && !this.backgroundImage) {
      this.chooseBackgroundImage()
      return
    }
    this.setData({
      backgroundModeIndex,
      backgroundMode: selected.value,
      backgroundModeLabel: selected.label
    }, () => this.draw())
  },

  onFitChange(event) {
    const fitIndex = Number(event.detail.value)
    const selected = FIT_OPTIONS[fitIndex]
    this.setData({
      fitIndex,
      fitLabel: selected.label,
      backgroundFit: selected.value
    }, () => this.draw())
  },

  onSliderChanging(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ [key]: event.detail.value, activePreset: '' })
    this.scheduleDraw(130)
  },

  onSliderChange(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ [key]: event.detail.value, activePreset: '' }, () => this.draw())
  },

  applyPreset(event) {
    const preset = event.currentTarget.dataset.preset
    this.seed = Math.floor(Math.random() * 1000000000)
    this.setData({ ...PRESETS[preset], activePreset: preset }, () => this.draw())
  },

  reroll() {
    this.seed = Math.floor(Math.random() * 1000000000)
    this.draw()
  },

  selectColor(event) {
    const backgroundColor = event.currentTarget.dataset.color
    this.setData({ backgroundColor }, () => this.draw())
  },

  onColorInput(event) {
    const value = event.detail.value.trim()
    this.setData({ backgroundColor: value })
    if (/^#[0-9a-f]{6}$/i.test(value)) this.scheduleDraw(100)
  },

  chooseBackgroundImage() {
    if (!this.canvas) {
      wx.showToast({ title: '画布正在初始化', icon: 'none' })
      return
    }
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const path = result.tempFilePaths[0]
        const image = this.canvas.createImage()
        wx.showLoading({ title: '读取图片' })
        image.onload = () => {
          wx.hideLoading()
          this.backgroundImage = image
          this.setData({
            backgroundImagePath: path,
            backgroundModeIndex: 3,
            backgroundMode: 'image',
            backgroundModeLabel: BACKGROUND_MODES[3].label
          }, () => this.draw())
        }
        image.onerror = () => {
          wx.hideLoading()
          wx.showToast({ title: '图片读取失败', icon: 'none' })
        }
        image.src = path
      }
    })
  },

  removeBackgroundImage() {
    this.backgroundImage = null
    this.setData({
      backgroundImagePath: '',
      backgroundModeIndex: 0,
      backgroundMode: 'gradient',
      backgroundModeLabel: BACKGROUND_MODES[0].label
    }, () => this.draw())
  },

  saveImage() {
    if (!this.canvas) {
      wx.showToast({ title: '画布正在初始化', icon: 'none' })
      return
    }
    if (this.drawTimer) clearTimeout(this.drawTimer)
    this.draw()
    const { width, height } = this.getOutputSize()
    wx.showLoading({ title: '正在生成', mask: true })
    wx.canvasToTempFilePath({
      canvas: this.canvas,
      x: 0,
      y: 0,
      width,
      height,
      destWidth: width,
      destHeight: height,
      fileType: 'png',
      quality: 1,
      success: (result) => this.saveToAlbum(result.tempFilePath),
      fail: (error) => {
        wx.hideLoading()
        console.error('导出失败', error)
        wx.showToast({ title: '图片导出失败', icon: 'none' })
      }
    })
  },

  saveToAlbum(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        wx.hideLoading()
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail: (error) => {
        wx.hideLoading()
        const denied = String(error.errMsg || '').includes('auth deny')
          || String(error.errMsg || '').includes('authorize:fail')
        if (!denied) {
          wx.showToast({ title: '保存失败，请重试', icon: 'none' })
          return
        }
        wx.showModal({
          title: '需要相册权限',
          content: '请在设置中允许保存图片到相册。',
          confirmText: '去设置',
          success: (result) => {
            if (result.confirm) wx.openSetting()
          }
        })
      }
    })
  }
})
