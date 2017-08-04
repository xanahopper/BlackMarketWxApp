//app.js
App({
  onLaunch: function() {
    //调用API从本地缓存中获取数据
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    var that = this
    this.getUserInfo(function(info) {
      that.globalData.userInfo = info
      that.getUserBindInfo(function(bindInfo) {
        console.log('Already has bind info')
      })
    })
  },

  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function(res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },
  getUserBindInfo: function (cb) {
    let that = this
    this.globalData.bindInfo = wx.getStorageSync('bindInfo') || null
    if (this.globalData.userInfo && this.globalData.bindInfo) {
      typeof cb == "function" && cb(this.globalData.bindInfo)
    } else {
      wx.redirectTo({
        url: '/pages/auth/auth',
      })
    }
  },
  setUserBindInfo: function(info, cb) {
    let that = this
    this.globalData.bindInfo = info
    wx.setStorageSync('bindInfo', info)
    typeof cb == "function" && cb(info)
  },

  globalData: {
    userInfo: null,
    bindInfo: null
  }
})
