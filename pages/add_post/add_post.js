// add_post.js
import wxw from '../../utils/wrapper'
import {ErrorTypes} from '../../utils/exception'

let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    courses: [{
      credit: 0,
      id: 0,
      name: '（无）',
      schedules: [],
      teacher: '（无）',
    }],
    courseNames: ['（无）'],
    demandIndex: 0,
    supplyIndex: 0,

    message: '',
    messageLength: 0,

    showTopTips: false,
    TopTips: '信息不完整',

    useMobile: true,
    wechatNo: '',
    bindInfo: {},
    edit: false,
    post_id: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    (app.globalData.courses.length > 0 ? Promise.resolve({data: app.globalData.courses}) : wxw.getCourses(app.globalData.session))
      .then(res => {
        let courses = this.data.courses
        let courseNames = this.data.courseNames
        res.data.forEach(item => {
          courses.push(item)
          courseNames.push(item.name)
        })
        that.setData({
          courses,
          courseNames,
          bindInfo: app.globalData.bindInfo
        })
      })
      .catch(err => {
        console.error(err)
      })

    if (options.edit && options.id) {
      wx.setNavigationBarTitle({
        title: '编辑信息'
      })
      wxw.getPost(app.globalData.session, options.id)
        .then(res => {
          console.log(res)
          res = res.data
          let data = {
            edit: true,
            post_id: res.id
          }
          if (res.post.demand.course_id !== 0) data.demandIndex = res.post.demand.course_id
          if (res.post.supply.course_id !== 0) data.supplyIndex = res.post.supply.course_id
          data.useMobile = (res.post.switch === 1)
          data.wechatNo = res.post.wechat
          data.message = res.post.message
          data.messageLength = data.message.length
          that.setData(data)
        })
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

  bindCommentChange(e) {
    this.setData({
      message: e.detail.value,
      messageLength: e.detail.value.length,
    })
  },

  checkInfo() {
    if (!this.data.useMobile && !this.data.wechatNo) {
      this.showTopTips('请至少填写一种联系方式')
    } else if (this.data.supplyIndex === 0 && this.data.demandIndex === 0) {
      this.showTopTips('请在需求和提供中至少选择一种')
    } else if (this.data.supplyIndex === this.data.demandIndex) {
      this.showTopTips('需求和提供不能相同')
    } else if (this.data.message.trim().length === 0) {
      this.showTopTips('留言不能为空')
    } else {
      return true
    }
    return false
  },

  /**
   * 提交需求信息
   * {
     *   supply: supplyIndex,
     *   demand: demandIndex,
     *   switch: useMobile,
     *   mobile: app.globalData.bindInfo.mobile,
     *   wechat: wechat_no,
     *   message
     * }
   */
  submitCreatePost(e) {
    let that = this
    if (this.checkInfo()) {
      let content = []
      if (this.data.demandIndex !== 0) content.push('需求：' + this.data.courseNames[this.data.demandIndex])
      if (this.data.supplyIndex !== 0) content.push('提供：' + this.data.courseNames[this.data.supplyIndex])
      content.push('供求一经发布不能修改，仅能修改联系方式与留言')
      wx.showModal({
        title: '发布确认',
        content: content.join("\n"),
        confirmText: '发布',
        cancelText: '取消',
        success(res) {
          if (res.confirm) {
            let data = {
              student_id: app.globalData.bindInfo.id.toString(),
              supply: Number.parseInt(that.data.supplyIndex),
              demand: Number.parseInt(that.data.demandIndex),
              'switch': that.data.useMobile ? 1 : 0,
              mobile: that.data.useMobile ? app.globalData.bindInfo.mobile : '',
              wechat: that.data.wechatNo,
              message: that.data.message,
            }
            wxw.createPost(app.globalData.session, data)
              .then(res => {
                console.log(res)
                app.globalData.needRefresh = true
                wx.showToast({
                  title: '添加成功',
                  icon: 'success',
                  duration: 2000,
                  complete() {
                    setTimeout(() => {
                      wx.switchTab({
                        url: '../index/index'
                      })
                    }, 2000)
                  }
                })
              })
              .catch(err => {
                if (err.type && err.type === ErrorTypes.Response) {
                  wxw.showMessage(err.data.data.errmsg, '错误')
                }
              })
          }
        }
      })

    }
  },

  submitEditPost(e) {
    let that = this
    if (this.checkInfo()) {
      let data = {
        'switch': that.data.useMobile ? 1 : 0,
        mobile: that.data.useMobile ? app.globalData.bindInfo.mobile : '',
        wechat: that.data.wechatNo,
        message: that.data.message,
      }
      wxw.editPost(app.globalData.session, data, this.data.post_id)
        .then(res => {
          app.globalData.needRefresh = true
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 2000,
            complete() {
              setTimeout(() => {
                wx.navigateBack()
              }, 2000)
            }
          })
        })
        .catch(err => {
          if (err.type && err.type === ErrorTypes.Response) {
            this.showMessage(err.data.data.errmsg, '错误')
          }
        })
    }
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

  bindUseMobileChange(e) {
    this.setData({
      useMobile: e.detail.value,
    })
  },

  bindWechatChange(e) {
    this.setData({
      wechatNo: e.detail.value,
    })
  },
  goBack(e) {
    wx.navigateBack()
  },
})