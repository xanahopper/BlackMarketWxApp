// pages/exchange/add_exchange.js
import wxw from '../../utils/wrapper'
import {ErrorTypes} from '../../utils/exception'
import Promise from '../../utils/es6-promise'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [],
    messageLength: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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

  chooseImage(e) {
    let that = this
    wxw.chooseImage(3 - this.data.files.length)
      .then(res => {
        let files = that.data.files.concat(res)
        that.setData({files})
        console.log(res)
      })
  },

  previewImage(e) {
    console.log(e)
  },

  removeImage(e) {
    let that = this
    wx.showModal({
      title: '删除图片',
      content: '确认删除此图片？',
      showCancel: true,
      success(res) {
        if (res.confirm) {
          console.log(e.target.dataset['id'])
          let index = e.target.dataset['id']
          let files = that.data.files
          files.splice(index, 1)
          that.setData({files})
        }
      }
    })
  }
})