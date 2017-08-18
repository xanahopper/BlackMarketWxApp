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
    sortState: 4,
    inputShowed: false,
    inputVal: '',
    hasMore: true,
    loading: false,
    courses: [],
    courseNames: [],
    students: {},
    posts: [],
    start: 0,
    limit: 10,
    order: 0,
    inited: false,

    supplyIndex: 0,
    demandIndex: 0,

    filterSupply: 0,
    filterDemand: 0
  },

  refreshPostList() {
    let that = this
    wx.showNavigationBarLoading()
    wxw.getPostList(app.globalData.session, this.data.order, 0, this.data.limit,
      this.data.filterSupply, this.data.filterDemand)
      .then(res => {
        console.log(res.data)
        let data = {
          start: that.data.start + res.data.length,
          loading: false,
          inited: true
        }
        data.hasMore = res.data.length >= that.data.limit;
        app.processData(res.data)
        data.posts = res.data
        that.setData(data)
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        // wx.pageScrollTo({
        //   scrollTop: 0
        // })
      })
      .catch(err => {
        that.setData({
          loading: false
        })
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      })
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
        let courses = [{
          credit: 0,
          id: 0,
          name: '（无）',
          schedules: [],
          teacher: '（无）',
        }]
        let courseNames = ['（无）']
        res.data.forEach(item => {
          courses.push(item)
          courseNames.push(item.name)
        })
        that.setData({
          courses,
          courseNames
        })
      })

  },

  onShow() {
    if (app.globalData.needRefresh) {
      app.globalData.needRefresh = false
      this.refreshPostList()
    }
  },


  onReachBottom(e) {
    let that = this
    if (that.data.hasMore && !this.data.loading) {
      this.setData({
        loading: true,
      })
      wxw.getPostList(app.globalData.session, this.data.order, this.data.start, this.data.limit,
        this.data.filterSupply, this.data.filterDemand)
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
    this.refreshPostList()
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
    let data = {
      filterShowed: false
    }
    let filterChanged = false
    if (this.data.supplyIndex !== this.data.filterSupply) {
      data.filterSupply = this.data.supplyIndex
      filterChanged = true
    }
    if (this.data.demandIndex !== this.data.filterDemand) {
      data.filterDemand = this.data.demandIndex
      filterChanged = true
    }
    this.setData(data)
    if (filterChanged) {
      this.refreshPostList()
    }
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
    let order = 0
    switch (this.data.sortState) {
      case 0:
      case 1:
      case 2:
      case 4:
        state = 3
        order = 1
        break
      case 3:
        state = 4
        order = 0
        break
    }
    this.setData({
      sortState: state,
      order
    })
    this.cancelMask()
    this.refreshPostList()
  },

  bindDemandChange(e) {
    this.setData({
      demandIndex: Number.parseInt(e.detail.value)
    })
  },

  bindSupplyChange(e) {
    this.setData({
      supplyIndex: Number.parseInt(e.detail.value),
    })
  },

  clearFilter(e) {
    this.setData({
      supplyIndex: 0,
      demandIndex: 0
    })
  }
})