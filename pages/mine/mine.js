var app = getApp()
Page({
  data: {
    userInfo: null,
    bindInfo: {
      grade: '',
      type: 0
    },
    grades: ['2014', '2015', '2016', '2017'],
    types: [],
    typeIndex: []
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log(app.globalData)
    this.setData({
      userInfo: app.globalData.userInfo,
      bindInfo: app.globalData.bindInfo,
      types: app.globalData.types,
      typeIndex: app.globalData.typeIndex
    })


  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.setData({
      userInfo: app.globalData.userInfo,
      bindInfo: app.globalData.bindInfo
    })
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  logout: function () {
    wx.showModal({
      title: '注销',
      content: '确认要注销么？',
      success: function (res) {
        if (res.confirm) {
          app.logout()
          wx.reLaunch({
            url: '../auth/auth'
          })
        }
      }
    })
  }
})