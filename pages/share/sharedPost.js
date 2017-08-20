// sharedPost.js
import wxw from '../../utils/wrapper'
import {ErrorTypes} from '../../utils/exception'
import moment from '../../utils/moment'

let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    err: 0,
    post_id: 0,
    post: {},
    courses: {},
    types: ['双学位', '元培PPE', '其他'],
    bindInfo: null,
    inited: false,
    hasViewedContract: false,

    showTopTips: false,
    TopTips: '出现错误',

    viewCount: 0
  },

  refreshPost(id) {
    let that = this
    // wx.showNavigationBarLoading()
    wx.showLoading()
    wxw.getSharedPost(id)
      .then(res => {
        app.processData([res.data.post], null, true)
        that.setData({
          post: res.data.post,
          inited: true
        })
        // wx.hideNavigationBarLoading()
        wx.hideLoading()
      })
      .catch(err => {
        this.setData({
          err: 2
        })
        // wx.hideNavigationBarLoading()
        wx.hideLoading()
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options.id) {
      wx.redirectTo({
        url: '../error/error'
      })
    }
    this.setData({
      post_id: options.id
    })


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
    if (!this.data.inited && this.data.post_id) {
      this.refreshPost(this.data.post_id)
    }
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  viewOrigin(e) {
    wx.showLoading()
    let url = '/pages/post/post?id=' + this.data.post.id
    app.checkLogin(url)
      .then(res => {
        wx.hideLoading()
        if (res && res.userInfo && res.bindInfo) {
          wx.redirectTo({
            url: url
          })
        }
      })
  }
})