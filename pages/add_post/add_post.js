// add_post.js
import wxw from '../../utils/wrapper'
import { ErrorTypes } from '../../utils/exception'
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    courses: [{
      credit: 0,
      id: 0,
      name: '（无）',
      schedules: [],
      teacher: '（无）'
    }],
    courseNames: ['（无）'],
    demandIndex: 0,
    supplyIndex: 0,

    message: "",
    messageLength: 0,

    showTopTips: false,
    TopTips: "信息不完整",

    useMobile: true,
    wechatNo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    let courses = this.data.courses
    let courseNames = this.data.courseNames
    wxw.getCourses(app.globalData.session)
      .then(res => {
        res.data.forEach(item => {
          courses.push(item)
          courseNames.push(item.name)
        })
        that.setData({
          courses,
          courseNames
        })
      })
      .catch(err => {
        console.error(err)
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

  bindCommentChange(e) {
    this.setData({
      message: e.detail.value,
      messageLength: e.detail.value.length
    })
  },

  /**
   * 提交需求信息
   * {
   *   student_id: <id>,
   *   supply: supplyIndex,
   *   demand: demandIndex,
   *   switch: useMobile,
   *   mobile: app.globalData.bindInfo.mobile,
   *   wechat: wechat_no,
   *   message
   * }
   */
  submitCreatePost(e) {

  },

  bindDemandChange(e) {
    this.setData({
      demandIndex: e.detail.value
    })
  },

  bindSupplyChange(e) {
    this.setData({
      supplyIndex: e.detail.value
    })
  },

  bindUseMobileChange(e) {
    console.log(e.detail.value)
    this.setData({
      useMobile: e.detail.value
    })
  }
})