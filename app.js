//app.js
import Promise from './utils/bluebird';
import {
  SessionExpiredError,
  LoginError,
  SessionError, 
  UserInfoError, 
  BindInfoError, 
  ServerError, 
  NetworkError, 
  EmptyLocalBindError,
  ResponseError,
  ErrorTypes
} from './utils/exception';
import wxw from './utils/wrapper';

App({
  globalData: {
    userInfo: null,
    bindInfo: null,
    session: null,
  },

  errorMsgs: {
    4001: '微信用户不存在'
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
    console.log('App onLaunch')
  },

  checkLogin: function () {
    var that = this
    console.log('Start check login')
    return wxw.checkSession()
      .then(() => {
        console.log('check wechat session successfully.')
        console.log('start get 3rd-session')
        return wxw.getSession()
          .then(session => {
            console.log('get 3rd-session ok. Start check 3rd-session')
            return wxw.checkServerSession(session)
          })
          .catch(err => {
            console.log('no local session')
            return Promise.reject(new SessionError())
          })
      })
      .catch(err => {
        if (err.type) {
          switch (err.type) {
            case ErrorTypes.Response:       // checkServerSession时服务器返回但是出错
            case ErrorTypes.SessionExpired: // checkSession超时
            case ErrorTypes.Session:        // getSession错误
              console.log('start login', err, err.stack)
              return wxw.wxLogin()
                .then(code => wxw.loginCode2Session(code))
                .catch(err => Promise.reject(err))  // LoginError || NetworkError || ServerError
            default:
              return Promise.reject(err)  // 
          }
        } else {
          return Promise.reject(err)
        }
      })
      .then(session => {
        that.globalData.session = session
        return wxw.getUserInfo(session)
      })
      .then(res => {
        that.globalData.userInfo = res.data.userInfo
        return wxw.uploadUserInfo(res.session, res.data)
      })
      .then(session => wxw.getLocalStudentInfo(session))
      .catch(err => {
        if (err.type && err.type == ErrorTypes.EmptyLocalBind) {
          return wxw.fetchServerStudentInfo(err.session)
        } else {
          return Promise.reject(err)
        }
      })
      .then(res => {
        console.log(res)
        that.globalData.bindInfo = res
        return Promise.resolve(that.globalData)
      })
      .catch(err => {
        console.error(err)
        if (err.type) {
          switch (err.type) {
            case ErrorTypes.Login:
            case ErrorTypes.UserInfo:
              wx.redirectTo({
                url: '/pages/no_auth/no_auth'
              })
              break
            case ErrorTypes.Server:
            case ErrorTypes.Response:
            default:
              wx.redirectTo({
                url: '/pages/error/error'
              })
              break
            case ErrorTypes.BindInfo:
              wx.redirectTo({
                url: '/pages/auth/auth'
              })
          }
        } else {
          wx.redirectTo({
            url: '/pages/error/error'
          })
        }
      })
  }
})
