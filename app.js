//app.js
import Promise from './utils/bluebird';
import { SessionExpiredError, LoginError, SessionError, UserInfoError, BindInfoError } from './utils/exception';

App({
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
    let that = this
    this.globalData.bindInfo = info
    wx.setStorageSync('bindInfo', info)
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success(data) {
          resolve(data)
        },
        fail() {
          reject(new LoginError('login failed'))
        }
      })
    })
      .then(res => {
        console.log('send code to back and get session')
        //获取到session
        wx.setStorageSync('session', 'session_demo')
        return Promise.resolve('session_demo')
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
          resolve(session)
        },
        fail() {
          reject(new SessionError('local session empty.'))
        }
      })
    })
      .then(session => {
        return Promise.resolve(session)
      })
      .catch(err => {
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
          console.log('fetch new data')
          return Promise.resolve({
            session: 'session_demo',
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
        console.error(JSON.stringify(err))
        if (err.type) {
          if (err.type == 5) {
            wx.redirectTo({
              url: '/pages/auth/auth'
            })
          } else if (err.type == 2 || err.type == 4) {
            wx.redirectTo({
              url: '/pages/no_auth/no_auth'
            })
          }
        }
      })
  },

  globalData: {
    userInfo: null,
    bindInfo: null,
    session: null,
  },

  constants: {
    requestUrl: "http://xanablackmarket.duapp.com/"
  }
})
