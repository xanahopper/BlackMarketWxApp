//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {},
    filterShowed: false,
    sortShowed: false,
    sortState: 0,
    inputShowed: false,
    inputVal: "",
    hasMore: true,
    posts: [{
      postId: 1,
      supply: '奇葩学',
      time: '2017-08-06',
      state: 0
    }, {
      postId: 1,
      supply: '奇葩学',
      time: '2017-08-06',
      state: 0
    }, {
      postId: 1,
      supply: '奇葩学',
      time: '2017-08-06',
      state: 0
    }, {
      postId: 1,
      supply: '奇葩学',
      time: '2017-08-06',
      state: 0
    }, {
      postId: 1,
      supply: '奇葩学',
      time: '2017-08-06',
      state: 0
    }]
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    app.checkLogin()
    .then(data => {
      wx.hideLoading()
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
