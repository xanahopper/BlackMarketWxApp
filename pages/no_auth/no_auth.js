Page({
  data: {

  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
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
  },
  authorize: function () {
    wx.openSetting({
      success: function (res) {
        if (res.authSetting && res.authSetting['scope.userInfo']) {
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }
      },
      complete: function () {
        wx.getSetting({
          scope: 'scope.userInfo',
          success: function (res) {
            if (res.authSetting['scope.userInfo']) {
              wx.reLaunch({
                url: '/pages/index/index'
              })
            }
          }
        })
      }
    })
  }
})