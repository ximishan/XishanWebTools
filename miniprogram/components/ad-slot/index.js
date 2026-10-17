Component({
  data: {
    loaded: false
  },

  properties: {
    enabled: {
      type: Boolean,
      value: false
    },
    unitId: {
      type: String,
      value: ''
    },
    adType: {
      type: String,
      value: 'banner'
    },
    adTheme: {
      type: String,
      value: 'white'
    },
    adIntervals: {
      type: Number,
      value: 60
    },
    gridCount: {
      type: Number,
      value: 5
    }
  },

  methods: {
    handleLoad(event) {
      this.setData({ loaded: true })
      this.triggerEvent('load', event.detail)
    },

    handleError(event) {
      this.setData({ loaded: false })
      console.warn('广告加载失败', event.detail)
      this.triggerEvent('error', event.detail)
    },

    handleClose(event) {
      this.setData({ loaded: false })
      this.triggerEvent('close', event.detail)
    }
  }
})
