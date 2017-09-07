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
    types: [],
    typeIndex: [],
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
    wxw.showLoading()
    wxw.getSharedPost(id)
      .then(res => {
        app.processData([res.data.post], null, true)
        if (res.data.post.demand.course) {
          app.processSchedules(res.data.post.demand.course)
        }
        if (res.data.post.supply.course) {
          app.processSchedules(res.data.post.supply.course)
        }
        that.setData({
          post: res.data.post,
          inited: true
        })
        // wx.hideNavigationBarLoading()
        wxw.hideLoading()
      })
      .catch(err => {
        this.setData({
          err: 2
        })
        // wx.hideNavigationBarLoading()
        wxw.hideLoading()
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
      post_id: options.id,
      types: app.globalData.types,
      typeIndex: app.globalData.typeIndex
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
    let that = this
    return {
      title: 'Black Market',
      desc: '快来和我换课吧',
      path: '/pages/share/sharedPost?id=' + encodeURIComponent(this.data.post.id),
      success(res) {
        wxw.postShare(that.data.post_id, 1, 0)
      }
    }
  },

  viewOrigin(e) {
    wxw.showLoading()
    let url = '/pages/post/post?id=' + this.data.post.id
    app.checkLogin(url)
      .then(res => {
        wxw.hideLoading()
        if (res && res.userInfo && res.bindInfo) {
          wx.redirectTo({
            url: url
          })
        }
      })
      .catch(err => {
        wxw.hideLoading()
        wx.navigateTo({
          url: '../error/error'
        })
      })
  },

  viewHome(e) {
    wxw.showLoading()
    app.checkLogin()
      .then(res => {
        wxw.hideLoading()
        if (res && res.userInfo && res.bindInfo) {
          wx.switchTab({
            url: '../index/index'
          })
        }
      })
      .catch(err => {
        wxw.hideLoading()
        wx.navigateTo({
          url: '../error/error'
        })
      })
  }
})