//app.js
import Promise from './utils/bluebird';
import { SessionExpiredError, LoginError, SessionError, UserInfoError, BindInfoError, ServerError, EmptyLocalBindError, ErrorTypes } from './utils/exception';

App({
  globalData: {
    userInfo: null,
    bindInfo: null,
    session: null,
  },

  constants: {
    requestUrl: "https://pkublackmarket.cn/api/v1/wechat/"
  },

  urls: {
    code2sessionUrl: "https://pkublackmarket.cn/api/v1/wechat/jscode2session",
    checkSessionUrl: "https://pkublackmarket.cn/api/v1/wechat/check_session",
  },

  onLaunch: function () {
    //调用API从本地缓存中获取数据
    // this.checkLogin()
  },

  getUserInfo: function (forceReload) {
    var that = this
    return new Promise((resolve, reject) => {
      if (that.globalData.userInfo && !forceReload) {
        resolve(that.globalData.userInfo)
      } else {
        wx.getUserInfo({
          withCredentials: true,
          success(res) {
            that.globalData.userInfo = res.userInfo
            resolve(res.userInfo)
          },
          fail() {
            reject(new UserInfoError())
          }
        })
      }
    })
      .then(userInfo => {
        return new Promise((resolve, reject) => {
          console.log('//TODO: 此处将userInfo上传')
          resolve(userInfo)
        })
      })
      .catch(err => {
        return Promise.reject(err)
      })
  },

  getUserBindInfo: function (forceReload) {
    let that = this
    return new Promise((resolve, reject) => {
      if (that.globalData.bindInfo && !forceReload) {
        resolve(that.globalData.bindInfo)
      } else {
        wx.getStorage({
          key: 'bindInfo',
          success(res) {
            resolve(res.data)
          },
          fail() {
            reject(new BindInfoError('No local bind info'))
          }
        })
      }
    })
      .then(res => {
        return Promise.resolve(res)
      })
      .catch(err => {
        // Get bind info from backend
        console.log('no bind info')
        return Promise.reject(err)
      })
  },

  setUserBindInfo: function (info) {
    console.log('//TODO: 更新服务器端绑定信息BindInfo')
    let that = this
    this.globalData.bindInfo = info
    wx.setStorageSync('bindInfo', info)
  },

  login() {
    let that = this
    return new Promise((resolve, reject) => {
      wx.login({
        success(data) {
          console.log(data)
          resolve(data)
        },
        fail() {
          reject(new LoginError('login failed'))
        }
      })
    })
      .then(res => {
        console.log('// TODO: 将Code发送至后端并换取session')
        //获取到session
        return new Promise((resolve, reject) => {
          console.log('Code换取Session')
          wx.request({
            url: that.urls.code2sessionUrl,
            data: {
              code: res.code
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success(session) {
              console.log(session)
              if (session.statusCode == 200 && session.data.session_key) {
                wx.setStorageSync('session', session.data.session_key)
                resolve(session)
              } else {
                reject(new ServerError('换取Session时出错, Code:' + session.statusCode))
              }
            },
            fail(err) {
              reject(new ServerError('Code换取Session时出现错误' + err))
            }
          })
        })
      })
      .then(session => {
        that.getUserInfo().then(() => null)
        return Promise.resolve(session)
      })
      .catch(err => {
        console.log('login failed')
        return Promise.reject(err)
      })
  },

  logout: function (cb) {
    wx.removeStorageSync('bindInfo')
    typeof cb == "function" && cb()
  },

  getSession: function () {
    let that = this
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'session',
        success(session) {
          if (session.data.length > 0 && session.data.length < 100) {
            resolve(session.data)
          } else {
            reject(new SessionError('invalid local session'))
          }
        },
        fail() {
          reject(new SessionError('local session empty.'))
        }
      })
    })
      .then(session => {
        return new Promise((resolve, reject) => {
          wx.request({
            url: that.urls.checkSessionUrl,
            data: {
              session_key: session
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success(res) {
              that.globalData.session = session
              resolve(session)
            },
            fail() {
              reject(new SessionError('第三方Session验证失败'))
            }
          })
        })
      })
      .catch(err => {
        console.error(err)
        return that.login()
      })
  },

  setSession(session) {
    let that = this
    this.globalData.session = session
    wx.setStorage({
      key: 'session',
      data: session,
      fail() {
        console.error('Session store failed.')
      }
    })
  },

  checkLogin: function () {
    var that = this
    // wx.redirectTo({
    //   url: '/pages/splash/splash'
    // })
    return new Promise((resolve, reject) => {
      console.log('checkSession')
      wx.checkSession({
        success() {
          resolve()
        },
        fail() {
          reject(new SessionExpiredError('Wechat session expired!'))
        }
      })
    })
      .then(() => {
        console.log('check success')
        return Promise.resolve()
      })
      .catch(reason => {
        // Check failed, login again
        console.log(reason)
        return that.login()
      })
      .then(() => {
        // Check success, send session to backend and get bind info
        console.log('Wechat session is valid.')
        return that.getSession()
      })
      // 
      .then(session => {
        if (that.globalData.session && that.globalData.userInfo && that.globalData.bindInfo) {
          console.log('use local data')
          return Promise.resolve(that.globalData)
        } else {
          console.log('// TODO: use session to fetch new data')
          return Promise.resolve({
            session: session,
            userInfo: null,
            bindInfo: null
          })
        }
      })
      .then(res => {
        let infoOp = []
        // Session
        infoOp.push(Promise.resolve(res.session))

        // User Info
        infoOp.push(new Promise((resolve, reject) => {
          console.log('// TODO: 比较新旧UserInfo，并更新服务器端UserInfo')
          if (!res.userInfo) {
            that.getUserInfo().then(info => {
              res.userInfo = info
              resolve(info)
            })
              .catch(err => { reject(err) })
          } else {
            resolve(res.userInfo)
          }
        }))

        // Bind Info
        infoOp.push(new Promise((resolve, reject) => {
          if (!res.bindInfo) {
            that.getUserBindInfo()
              .then(info => {
                res.bindInfo = info
                resolve(info)
              })
              .catch(err => {
                reject(err)
              })
          } else {
            resolve(res.bindInfo)
          }
        }))

        return Promise.all(infoOp)
      })
      .then(data => {
        console.log(data)
        that.setSession(data[0])
        that.globalData.userInfo = data[1]
        that.globalData.bindInfo = data[2]
        return Promise.resolve(that.globalData)
      })
      .catch(err => {
        console.error(JSON.stringify(err), err)
        if (err.type) {
          switch (err.type) {
            case 2:
            case 4:
              wx.redirectTo({
                url: '/pages/no_auth/no_auth'
              })
              break
            case 5:
              wx.redirectTo({
                url: '/pages/auth/auth'
              })
              break
            case 6:
              wx.redirectTo({
                url: '/pages/error/error'
              })
          }
        }
      })
  }
})
