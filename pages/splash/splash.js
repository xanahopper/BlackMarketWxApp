let app = getApp()
Page({
  data: {

  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    app.checkLogin()
      .then(data => {
        console.log("data: ", data)
        wx.hideLoading()
        if (data && data.session && data.userInfo && data.bindInfo) {
          wx.switchTab({
            url: '../index/index'
          })
        }
      })
      .catch(err => {
        console.error(err.stack)
      })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})