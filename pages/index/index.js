//index.js
//获取应用实例
import wxw from '../../utils/wrapper'
import { ErrorTypes } from '../../utils/exception'
import moment from '../../utils/moment.min'
var app = getApp()
Page({
  data: {
    userInfo: {},
    filterShowed: false,
    sortShowed: false,
    sortState: 3,
    inputShowed: false,
    inputVal: "",
    hasMore: true,
    courses: {},
    posts: []
  },
  onLoad: function () {
    let that = this
    if (app.globalData.session && app.globalData.userInfo && app.globalData.bindInfo) {
      this.setData(app.globalData)
    } else {
      wx.redirectTo({
        url: '../splash/splash'
      })
    }

    wxw.getCourses(app.globalData.session)
      .then(res => {
        let courses = {}
        res.data.forEach(item => {
          courses[item.id] = item
        })
        that.setData({
          courses
        })
      })

    wxw.getPost(app.globalData.session)
      .then(res => {
        console.log(res.data)
        res.data.forEach(item => {
          item.create_time = moment(item.create_time).format('YYYY-MM-DD HH:mm:ss')
          item.update_time = moment(item.update_time).format('YYYY-MM-DD HH:mm:ss')
        })
        that.setData({
          posts: res.data
        })
      })

  },
  showInput: function () {
      this.setData({
          inputShowed: true
      });
  },
  hideInput: function () {
      this.setData({
          inputVal: "",
          inputShowed: false
      });
  },
  clearInput: function () {
      this.setData({
          inputVal: ""
      });
  },
  inputTyping: function (e) {
      this.setData({
          inputVal: e.detail.value
      });
  },
  toggleSort(e) {
    let that = this
    this.setData({
      sortShowed: !that.data.sortShowed
    })
  },
  hideSort() {
    this.setData({
      sortShowed: false
    })
  },
  cancelMask() {
    this.hideSort()
  },
  setSortState(e) {
    if (e.currentTarget.dataset.state) {
      this.setData({
        sortState: Number.parseInt(e.currentTarget.dataset.state)
      })
    }
    this.cancelMask()
  },
  toggleTimeSort(e) {
    var state = 0
    switch(this.data.sortState) {
      case 0:
      case 1:
      case 2:
      case 4:
        state = 3
        break
      case 3:
        state = 4
        break
    }
    this.setData({
      sortState: state
    })
    this.cancelMask()
  }
})
