// edit_info.js
import wxw from '../../utils/wrapper'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gradeIndex: 0,
    grades: ['2014', '2015', '2016', '2017'],

    typeIndex: 0,
    types: ['双学位', '元培PPE', '其他'],
    session: null,
    bindInfo: null,

    showTopTips: false,
    TopTips: "信息不完整",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      session: app.globalData.session,
      bindInfo: app.globalData.bindInfo,
      gradeIndex: this.data.grades.indexOf(app.globalData.bindInfo.grade),
      typeIndex: app.globalData.bindInfo.type
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

  bindGradeChange(e) {
    this.setData({
      gradeIndex: e.detail.value
    })
  },

  bindTypeChange(e) {
    console.log(e.detail.value)
    this.setData({
      typeIndex: e.detail.value
    })
  },

  showTopTips: function (tip) {
    let that = this
    this.setData({
      TopTips: tip || that.data.TopTips,
      showTopTips: true
    })
    setTimeout(function () {
      that.setData({
        showTopTips: false
      })
    }, 3000)
  },

  submitInfo(e) {
    let data = {
      grade: this.data.grades[this.data.gradeIndex],
      type: Number.parseInt(this.data.typeIndex)
    }
    console.log(data)
    wxw.uploadStudentInfo(this.data.session, data, 'PUT')
      .then(res => {
        app.globalData.bindInfo = res.data
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000,
          mask: true,
          complete() {
            setTimeout(() => {
              wx.navigateBack()
            }, 2000)
          }
        })
      })
      .catch(err => {
          console.log(err)
          if (err.type && err.type == ErrorTypes.Response) {
            that.showTopTips(err.errMsg)
          }
        })
  }
})