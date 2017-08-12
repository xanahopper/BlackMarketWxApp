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
    post: {},
    courses: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

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

      wxw.getPost(app.globalData.session, options.id)
        .then(res => {
          app.processData([res.data], null, true)
          that.setData({
            post: res.data
          })
        })
        .catch(err => {
          this.setData({
            err: 2
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
      content: '你确定要拨打"' + this.data.post.student_name + '"的电话"' + this.data.post.mobile + '"么？',
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
  }
})