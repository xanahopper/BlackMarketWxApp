// auth.js
import wxw from '../../utils/wrapper'
import { ErrorTypes } from '../../utils/exception'
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
    TopTips: "信息不完整",

    gradeIndex: 0,
    grades: ['2014', '2015', '2016', '2017'],

    typeIndex: 0,
    types: ['双学位', '元培PPE', '其他'],
    session: null,

    verifyCodeCountdown: 0,
    edit: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('Auth onLoad')
    let that = this
    if (options.edit && options.edit == "1") {
      this.setData({
        edit: true,
        isAgree: true,
        gradeIndex: this.data.grades.indexOf(app.globalData.bindInfo.grade),
        typeIndex: app.globalData.bindInfo.type,
        phoneNum: app.globalData.bindInfo.mobile,
        session: app.globalData.session
      })
    } else {
      wxw.getSession()
        .then(session => {
          if (typeof session === "string") {
            that.setData({
              session
            })
          } else {
            wx.redirectTo({
              url: '../error/error'
            })
          }
        })
      if (app.globalData.bindInfo && !this.data.edit) {
        console.log('Auth redirect to index')
        wx.switchTab({
          url: '../index/index'
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length
    })
  },

  bindPhoneInput: function (e) {
    this.setData({
      phoneNum: e.detail.value
    })
  },

  bindVerifyInput: function (e) {
    this.setData({
      verifyCode: e.detail.value
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

  submitBindPhone: function () {
    if (this.data.isAgree && this.data.phoneNum != null && this.data.verifyCode != null) {
      let data = {
        mobile: this.data.phoneNum,
        verify_code: this.data.verifyCode,
        session_key: this.data.session,
        grade: this.data.grades[this.data.gradeIndex],
        type: this.data.typeIndex
      }
      wxw.uploadStudentInfo(this.data.session, data)
        .then(res => {
          app.globalData.bindInfo = res.data
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 2000,
            mask: true,
            complete: function () {
              setTimeout(() => {
                wx.switchTab({
                  url: '/pages/index/index'
                })
              }, 2000)
            }
          })
        })
        .catch(err => {
          if (err.type && err.type === ErrorTypes.Response) {
            console.error(err.data)
            this.showTopTips(err.data.data.errmsg)
          }
        })
    } else {
      this.showTopTips("请填写完整的信息")
    }
  },

  requestVerifyCode: function () {
    let that = this
    if (this.data.verifyCodeCountdown === 0) {
      if (this.data.phoneNum) {
        wxw.getVerifyCode(this.data.session, this.data.phoneNum)
          .then(res => {
            console.log(res)
            that.setData({ verifyCodeCountdown: 60 })
            that.countdown(that)
          })
          .catch(err => {
            if (err.type && err.type === ErrorTypes.Response) {
              if (err.data.errMsg) {
                that.showTopTips(err.data.errMsg)
              }
            }
          })
      } else {
        this.showTopTips("请填写有效的手机号码")
      }
    }
  },

  countdown(that) {
    let second = that.data.verifyCodeCountdown
    if (second === 0) {
      that.setData({
        verifyCodeCountdown: 0,
      })
      return
    }
    let time = setTimeout(() => {
      that.setData({
        verifyCodeCountdown: second - 1
      })
      that.countdown(that)
    }, 1000)
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
  },
  goBack(e) {
    wx.navigateBack()
  }
})