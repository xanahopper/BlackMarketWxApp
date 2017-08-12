//index.js
//获取应用实例
import wxw from '../../utils/wrapper'
import {ErrorTypes} from '../../utils/exception'

let app = getApp()
Page({
  data: {
    userInfo: {},
    filterShowed: false,
    sortShowed: false,
    sortState: 3,
    inputShowed: false,
    inputVal: '',
    hasMore: true,
    loading: false,
    courses: {},
    students: {},
    posts: [],
    start: 0,
    limit: 10,
  },
  onLoad(options) {
    let that = this
    if (app.globalData.session && app.globalData.userInfo && app.globalData.bindInfo) {
      this.setData(app.globalData)
    } else {
      wx.redirectTo({
        url: '../splash/splash',
      })
    }

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

    wxw.getPostList(app.globalData.session, this.data.start, this.data.limit)
      .then(res => {
        console.log(res.data)
        let data = {
          start: that.data.start + res.data.length,
        }
        if (res.data.length < that.data.limit) data.hasMore = false
        app.processData(res.data)
        data.posts = res.data
        that.setData(data)
      })

  },


  onReachBottom(e) {
    let that = this
    if (that.data.hasMore && !this.data.loading) {
      this.setData({
        loading: true,
      })
      wxw.getPostList(app.globalData.session, this.data.start, this.data.limit)
        .then(res => {
          console.log(res.data)
          let data = {
            start: that.data.start + res.data.length,
            posts: that.data.posts,
            loading: false,
          }
          if (res.data.length < that.data.limit) data.hasMore = false
          app.processData(res.data, item => {
            data.posts.push(item)
          })
          that.setData(data)
        })
        .catch(err => {
          that.setData({
            loading: false
          })
        })
    }
  },
  onPullDownRefresh() {
    let that = this
    this.setData({
      loading: true
    })
    wxw.getPostList(app.globalData.session, 0, 10)
      .then(res => {
        let data = {
          start: 0,
          limit: 10,
          loading: false
        }
        if (res.data.length  < 10) data.hasMore = false
        app.processData(res.data)
        data.posts = res.data
        that.setData(data)
        wx.stopPullDownRefresh()
      })
      .catch(err => {
        that.setData({
          loading: false,
        })
        wx.stopPullDownRefresh()
      })
  },
  showInput: function () {
    this.setData({
      inputShowed: true,
    })
  },
  hideInput: function () {
    this.setData({
      inputVal: '',
      inputShowed: false,
    })
  },
  clearInput: function () {
    this.setData({
      inputVal: '',
    })
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value,
    })
  },
  toggleSort(e) {
    let that = this
    this.setData({
      sortShowed: !that.data.sortShowed,
    })
  },
  hideSort() {
    this.setData({
      sortShowed: false,
    })
  },
  hideFilter() {
    this.setData(({
      filterShowed: false
    }))
  },
  cancelMask() {
    if (this.data.sortShowed)
      this.hideSort()
    if (this.data.filterShowed)
      this.hideFilter()
  },
  setSortState(e) {
    if (e.currentTarget.dataset.state) {
      this.setData({
        sortState: Number.parseInt(e.currentTarget.dataset.state),
      })
    }
    this.cancelMask()
  },
  setFilterState(e) {

  },
  toggleFilter(e) {
    this.setData({
      filterShowed: !this.data.filterShowed
    })
  },
  toggleTimeSort(e) {
    let state = 0
    switch (this.data.sortState) {
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
      sortState: state,
    })
    this.cancelMask()
  },
})