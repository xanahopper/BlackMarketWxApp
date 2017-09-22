import wxw from '../../utils/wrapper'
import {ErrorTypes} from '../../utils/exception'
import Promise from '../../utils/es6-promise'
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
    let options = {
      url: '/pages/index/index'
    }
    wxw.openSetting({
      success: function (res) {
        if (res.authSetting && res.authSetting['scope.userInfo']) {
          wxw.reLaunch(options, () => {
            wx.switchTab(options)
          })
        }
      },
      complete: function () {
        wxw.getSetting({
          scope: 'scope.userInfo',
          success: function (res) {
            if (res.authSetting['scope.userInfo']) {
              wxw.reLaunch(options, () => {
                wx.switchTab(options)
              })
            }
          }
        })
      }
    })
  }
})