// post.js
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
    init: true
  },

  refreshPost(id) {
    let that = this
    wx.showNavigationBarLoading()
    wxw.getPost(app.globalData.session, id)
      .then(res => {
        app.processData([res.data], null, true)
        that.setData({
          post: res.data
        })
        wx.hideNavigationBarLoading()
      })
      .catch(err => {
        this.setData({
          err: 2
        })
        wx.hideNavigationBarLoading()
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    this.setData({
      bindInfo: app.globalData.bindInfo,
      post_id: options.id
    })
    if (!options.id) {
      this.setData({
        err: 1
      })
    } else {
      (app.globalData.courseNames.length > 0 ? Promise.resolve({ data: app.globalData.courses}) : wxw.getCourses(app.globalData.session))
      .then(res => {
        let courses = {}
        res.data.forEach(item => {
          courses[item.id] = item
        })
        that.setData({
          courses,
        })
      })
    }
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
    if (this.data.init || app.globalData.needRefresh) {
      this.refreshPost(this.data.post_id)
      if (this.data.init) this.setData({init: false})
      if (app.globalData.needRefresh) app.globalData.needRefresh = false
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
    wx.stopPullDownRefresh()
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

  bindDialMobile(e) {
    let that = this
    wx.showModal({
      title: '拨打电话',
      content: '你确定要拨打"' + this.data.post.student_id.username + '"的电话"' + this.data.post.mobile + '"么？',
      confirmText: '确定',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: that.data.post.mobile
          })
        }
      }
    })
  },

  bindCopyWechat(e) {
    wx.setClipboardData({
      data: this.data.post.wechat,
      success(res) {
        wx.showToast({
          title: '微信已复制',
          icon: 'success',
          duration: 1000
        })
      }
    })
  },

  changePostStatus(e) {
    let that = this
    wx.showActionSheet({
      itemList: ['交易完成', '交易取消'],
      success(res) {
        if (!res.cancel) {
          let status = 0

          if (res.tapIndex === 0) status = 1
          else if (res.tapIndex === 1) status = 2
          else status = 0

          wxw.request(wxw.urls.postUrl + that.data.post.id, {
            status
          }, wxw.getSessionHeader(app.globalData.session), 'json', 'PUT')
            .then(res => {
              console.log(res)
              that.refreshPost(that.data.post.id)
              app.globalData.needRefresh = true
            })
        }
      }
    })
  },

  editPost(e) {
    wx.navigateTo({
      url: '../add_post/add_post?edit=1&id=' + this.data.post.id
    })
  }
})