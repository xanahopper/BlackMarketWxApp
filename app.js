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
} from './utils/exception'
import wxw from './utils/wrapper'
import moment from './utils/moment'

let weekDays = ['一', '二', '三', '四', '五', '六', '日']

App({
  globalData: {
    userInfo: null,
    bindInfo: null,
    courses: [],
    courseNames: [],
    session: null,
    needRefresh: true,
    types: [{
      name: 'NSD本科生',
      value: 1
    }, {
      name: 'NSD双学位',
      value: 2
    }, {
      name: '元培PPE',
      value: 3,
    }, {
      name: '其他',
      value: 0
    }],
    typeValues: [1, 2, 3, 0],
    typeIndex: [3, 0, 1, 2]
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

  processData(data, cb, origin = false) {
    data.forEach(item => {
      item.create_time = moment.utc(item.create_time).format('YYYY-MM-DD HH:mm:ss')
      item.update_time = moment.utc(item.update_time).format('YYYY-MM-DD HH:mm:ss')
      if (!origin && item.message.length > 15) item.message = item.message.substr(0, 15) + '...'
      if (cb) cb(item)
    })
  },

  processSchedules(data) {
    if (data.schedules) {
      data.schedule_label = data.schedules.map(item => {
        let desc = '周' + weekDays[item.day - 1] + '第' + item.start + '至' + item.end + '节'
        if (item.frequency === 'every') {
          desc = '每' + desc
        } else if (item.frequency === 'odd') {
          desc += '（单周）'
        } else if (item.frequency === 'even') {
          desc += '（双周）'
        }
        return desc
      })
    }
  },

  fetchCourses() {
    let that = this
    return wxw.getCourses(that.globalData.session)
      .then(res => {
        that.globalData.courses = res.data
        that.globalData.courseNames = []
        res.data.forEach(item => {
          that.globalData.courseNames.push(item.name)
          that.processSchedules(item)
        })
        return Promise.resolve(that.globalData)
      })
  },

  checkLogin(url) {
    let that = this
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
        if (err.type && err.type === ErrorTypes.EmptyLocalBind) {
          return wxw.fetchServerStudentInfo(err.session)
        } else {
          return Promise.reject(err)
        }
      })
      .then(res => {
        console.log(res)
        that.globalData.bindInfo = res

        return that.fetchCourses()
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
                url: '/pages/auth/auth' + (url ? ('?redirect=' + encodeURIComponent(url)) : '')
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
