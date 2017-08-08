// auth.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneNum: null,
    verifyCode: null,
    isAgree: false,
    showTopTips: false,
    
    gradeIndex: 0,
    grades: ['2014', '2015', '2016', '2017'],

    typeIndex: 0,
    types: ['双学位', '元培PPE', '其他'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('Auth onLoad')
    if (app.globalData.bindInfo) {
      console.log('Auth redirect to index')
      wx.redirectTo({
        url: '../index/index'
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

  bindAgreeChange: function(e) {
    this.setData({
      isAgree: !!e.detail.value.length
    })
  },

  bindPhoneInput: function(e) {
    this.setData({
      phoneNum: e.detail.value
    })
  },

  bindVerifyInput: function(e) {
    this.setData({
      verifyCode: e.detail.value
    })
  },

  showTopTips: function(tip) {
    let that = this
    this.setData({
      showTopTips: true
    })
    setTimeout(function() {
      that.setData({
        showTopTips: false
      })
    }, 3000)
  },

  submitBindPhone: function() {
    if (this.data.isAgree && this.data.phoneNum != null && this.data.verifyCode != null) {
      app.setUserBindInfo({
          phoneNum: this.data.phoneNum
      })
      wx.showToast({
        title: '绑定成功',
        icon: 'success',
        duration: 2000,
        mask: true,
        complete: function() {
          wx.reLaunch({
            url: '/pages/index/index'
          })
          // wx.redirectTo({
          //   url: '../index/index'
          // })
        }
      })
    } else {
      this.showTopTips()
    }
  },

  requestVerifyCode: function() {

  },

  bindGradeChange(e) {
    this.setData({
      gradeIndex: e.detail.value
    })
  },

  bindTypeChange(e) {
    this.setData({
      typeIndex: e.detail.value
    })
  }
})