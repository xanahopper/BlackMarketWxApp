// my_list.js

import wxw from '../../utils/wrapper'

let app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    filterShowed: false,
    sortState: 4,
    posts: [],
    start: 0,
    limit: 10,
    order: 0,
    courses: [],
    courseNames: [],
    inited: false,
    loading: false,
    hasMore: true,
    needRefresh: false,

    supplyIndex: 0,
    demandIndex: 0,
    onlyOpen: false,

    filterSupply: 0,
    filterDemand: 0,
    filterOnlyOpen: false,

    showTopTips: false,
    TopTips: '出现错误',
  },

  refreshPostList() {
    let that = this
    wx.showNavigationBarLoading()
    let data = {
      order: this.data.order,
      start: 0,
      limit: this.data.limit,
      supply: this.data.filterSupply,
      demand: this.data.filterDemand,
      closed: this.data.filterOnlyOpen ? 0 : 1
    }

    wxw.getMyPost(app.globalData.session, data)
      .then(res => {
        console.log(res)
        let data = {
          start: that.data.start + res.length,
          loading: false,
          inited: true,
        }
        data.hasMore = res.length >= that.data.limit
        app.processData(res)
        data.posts = res
        that.setData(data)
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.pageScrollTo({
          scrollTop: 0,
        })
      })
      .catch(err => {
        that.setData({
          loading: false,
        })
        wx.stopPullDownRefresh()
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;

    (app.globalData.courseNames.length > 0 ? Promise.resolve({data: app.globalData.courses}) : wxw.getCourses(app.globalData.session))
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
          courseNames,
        })
      })

    if (!this.data.inited) {
      this.refreshPostList()
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
    if (app.globalData.needRefresh) {
      this.refreshPostList()
      app.globalData.needRefresh = false
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

    let that = this
    this.setData({
      loading: true,
    })
    this.refreshPostList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this
    if (that.data.hasMore && !this.data.loading) {
      this.setData({
        loading: true,
      })
      let data = {
        order: this.data.order,
        start: this.data.start,
        limit: this.data.limit,
        supply: this.data.filterSupply,
        demand: this.data.filterDemand,
      }
      wxw.getPostList(app.globalData.session, data)
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
            loading: false,
          })
        })
    }
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
      filterShowed: false,
    }
    this.setData(data)
  },

  comfirmFilter(e) {
    let data = {
      filterShowed: false,
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
    if (this.data.onlyOpen !== this.data.filterOnlyOpen) {
      data.filterOnlyOpen = this.data.onlyOpen
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
    let data = {
      filterShowed: !this.data.filterShowed,
    }
    if (data.filterShowed) {
      data.demandIndex = this.data.filterDemand
      data.supplyIndex = this.data.filterSupply
      data.onlyOpen = this.data.filterOnlyOpen
    }
    this.setData(data)
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
      order,
    })
    this.cancelMask()
    this.refreshPostList()
  },

  bindDemandChange(e) {
    this.setData({
      demandIndex: Number.parseInt(e.detail.value),
    })
  },

  bindSupplyChange(e) {
    this.setData({
      supplyIndex: Number.parseInt(e.detail.value),
    })
  },

  showTopTips: function (tip) {
    let that = this
    this.setData({
      TopTips: tip || that.data.TopTips,
      showTopTips: true,
    })
    setTimeout(function () {
      that.setData({
        showTopTips: false,
      })
    }, 3000)
  },

  changePostStatus(e) {
    let that = this
    console.log(e)
    wx.showActionSheet({
      itemList: ['交易完成', '交易取消'],
      success(res) {
        if (!res.cancel) {
          let status = 0

          if (res.tapIndex === 0) status = 1
          else if (res.tapIndex === 1) status = 2
          else status = 0

          return wxw.putPostStatus(app.globalData.session, e.target.dataset.id, status)
            .then(res => {
              console.log(res)
              that.refreshPostList()
              app.globalData.needRefresh = true
            })
            .catch(err => {
              wxw.showMessage('关闭失败，请重新尝试')
            })
        }
      },
    })
  },

  clearFilter(e) {
    let filterChange = (this.data.filterSupply !== 0 || this.data.filterDemand !== 0)
    this.setData({
      supplyIndex: 0,
      demandIndex: 0,
      filterSupply: 0,
      filterDemand: 0,
      filterShowed: false,
    })
    if (filterChange) this.refreshPostList()
  },

  bindOnlyOpen(e) {
    this.setData({
      onlyOpen: e.detail.value,
    })
  },
})