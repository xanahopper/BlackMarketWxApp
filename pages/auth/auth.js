// auth.js
import wxw from '../../utils/wrapper'
import { ErrorTypes } from '../../utils/exception'
let app = getApp()
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

    gradeIndex: -1,
    grades: ['2017', '2016', '2015', '2014', '2013', '2012', '其他'],
    grade: '',
    customGrade: false,

    typeIndex: -1,
    types: [],
    typeIndices: [],
    session: null,

    verifyCodeCountdown: 0,
    edit: false,
    redirect: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('Auth onLoad')
    let that = this
    if (options.redirect) {
      this.setData({
        redirect: options.redirect
      })
    }
    if (options.edit && options.edit === "1") {
      this.setData({
        edit: true,
        isAgree: true,
        gradeIndex: this.data.grades.indexOf(app.globalData.bindInfo.grade),
        typeIndex: app.globalData.typeIndex[app.globalData.bindInfo.type],
        phoneNum: app.globalData.bindInfo.mobile,
        session: app.globalData.session,
        types: app.globalData.types,
        typeIndices: app.globalData.typeIndex
      })
    } else {
      wxw.getSession()
        .then(session => {
          if (typeof session === "string") {
            that.setData({
              session,
              types: app.globalData.types,
              typeIndices: app.globalData.typeIndex
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
    if (e.detail.value.length >= 6) {
      wx.hideKeyboard()
    }
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
    let that = this
    if (this.data.isAgree && this.data.phoneNum !== null && this.data.verifyCode !== null
      && this.data.typeIndex !== -1 && (this.data.gradeIndex !== -1 ||
      (this.data.gradeIndex === this.data.grades.length - 1 && this.data.grade.trim().length !== 0))) {
      let grade = (this.data.gradeIndex !== this.data.grades.length - 1) ? this.data.grades[this.data.gradeIndex] : this.data.grade
      let data = {
        mobile: this.data.phoneNum,
        verify_code: this.data.verifyCode,
        session_key: this.data.session,
        grade,
        type: this.data.types[this.data.typeIndex].value
      }
      wxw.uploadStudentInfo(this.data.session, data)
        .then(res => {
          app.globalData.bindInfo = res.data
          app.fetchCourses()
            .then(_ => {
              wx.showToast({
                title: '绑定成功',
                icon: 'success',
                duration: 2000,
                mask: true,
                complete: function () {
                  setTimeout(() => {
                    if (that.data.redirect) {
                      wx.redirectTo({
                        url: decodeURIComponent(that.data.redirect)
                      })
                    } else {
                      wx.redirectTo({
                        url: '/pages/profile/profile?uid=' + res.data.id + '&url=/pages/index/index&urlType=1'
                      })
                    }
                  }, 2000)

                }
              })
            })

        })
        .catch(err => {
          if (err.type && err.type === ErrorTypes.Response) {
            console.error(err.data)
            wxw.showMessage(err.data.data.errmsg)
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
            let data = { verifyCodeCountdown: 60 }
            if (res.data.code && res.data.msg) {
              wxw.showMessage(res.data.msg)
              data.verifyCode = res.data.code
            }
            that.setData(data)
            that.countdown(that)
          })
          .catch(err => {
            if (err.type && err.type === ErrorTypes.Response) {
              console.log(err)
              if (err.data.data.errmsg) {
                wxw.showMessage(err.data.data.errmsg)
              } else {
                wxw.showMessage('获取验证码时出现错误，请重试')
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
    let data = {
      gradeIndex: Number.parseInt(e.detail.value)
    }
    data.customGrade = Number.parseInt(e.detail.value) === this.data.grades.length - 1;
    this.setData(data)
  },

  bindGradeInput(e) {
    this.setData({
      grade: e.detail.value
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