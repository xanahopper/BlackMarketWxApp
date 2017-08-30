// profile.js
import wxw from '../../utils/wrapper'
import moment from '../../utils/moment'

import {
  SessionExpiredError,
  LoginError,
  SessionError,
  UserInfoError,
  BindInfoError,
  ServerError,
  NetworkError,
  EmptyLocalBindError,
  ResponseError,
  ErrorTypes
} from '../../utils/exception'

let app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shared: 0,
    userId: 0,
    student: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let data = {}
    console.log(options)
    if (options.uid) {
      data.userId = options.uid
    } else {
      wxw.showMessage('uid不存在')
      // wx.redirectTo({
      //   url: '../error/error'
      // })
    }
    if (options.shared) {
      data.shared = options.shared
    }
    if (options.url && options.urlType) {
      data.nextUrl = options.url
      data.urlType = options.urlType
    }
    let that = this
    wx.showLoading()
    wxw.getSharedProfile(data.userId)
      .then(res => {
        res.create_time = moment.utc(res.create_time).format('YYYY年MM月DD日 HH:mm')
        that.setData({
          student: res
        })
        wx.hideLoading()
      })
      .catch(err => {
        wx.hideLoading()
        wxw.showMessage('type: ' + err.type + ', msg: ' + err.message)
        // wx.redirectTo({
        //   url: '../error/error'
        // })
      })
    this.setData(data)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this
    return {
      title: '我是Black Market第' + this.data.student.id + '位用户',
      desc: '我是Black Market第' + this.data.student.id + '位用户',
      path: '/pages/profile/profile?uid=' + this.data.userId + '&shared=1',
      success() {
        wxw.profileShare(that.data.userId)
      }
    }
  },

  gotoApp() {
    wx.redirectTo({
      url: '../splash/splash'
    })
  },

  gotoNext() {
    if (this.data.nextUrl && this.data.urlType) {
      if (this.data.urlType === 0) {
        wx.redirectTo({
          url: this.data.nextUrl
        })
      } else {
        wx.switchTab({
          url: this.data.nextUrl
        })
      }
    }
  },

  previewAvatar(e) {
    wx.previewImage({
      urls: [this.data.student.avatar_url]
    })
  },

  shareProfile() {
    wx.showShareMenu()
  },

  shareMoment() {
    let that = this
    wx.showModal({
      content: '将打开的图片保存后，可分享于朋友圈',
      showCancel: false,
      complete() {
        wx.showLoading()
        wxw.getSharedProfileImage(that.data.userId)
          .then(res => {
            wx.hideLoading()
            wx.previewImage({
              urls: [res.tempFilePath]
            })
          })
          .catch(err => {
            wx.hideLoading()
            console.log(err.message)
          })
      }
    })


  }
})