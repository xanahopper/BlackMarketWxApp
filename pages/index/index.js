//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {},
    inputShowed: false,
    inputVal: "",
    hasMore: true,
    posts: [{
      id: 1,
      supply: '金融经济学',
      demand: '环境经济学',
      grade: '经双2015级',
      time: '2017-08-03 22:41:32',
      state: 1
    }, {
      id: 2,
      supply: null,
      demand: '环境经济学',
      grade: '经双2014级',
      time: '2017-08-03 22:41:32',
      state: 0
    }, {
      id: 3,
      supply: '金融经济学',
      demand: '环境经济学',
      grade: '经双2015级',
      time: '2017-08-03 22:41:32',
      state: 2
    }, {
      id: 4,
      supply: '金融经济学',
      demand: null,
      grade: '经双2014级',
      time: '2017-08-02 12:41:32',
      state: 0
    }]
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
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
  }
})
