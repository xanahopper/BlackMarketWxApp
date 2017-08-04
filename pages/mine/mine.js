var app = getApp()
Page({
  data:{
    userInfo: null,
    bindInfo: null
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    let that = this
    app.getUserInfo(function(userInfo) {
      var data = {
        userInfo: userInfo
      }
      app.getUserBindInfo(function(bindInfo) {
        data.bindInfo = bindInfo
        console.log(data)
        that.setData(data)
      })
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})