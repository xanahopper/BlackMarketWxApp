import Promise from 'bluebird'
import {
  SessionExpiredError,
  LoginError,
  SessionError, 
  UserInfoError, 
  BindInfoError, 
  ServerError, 
  NetworkError, 
  EmptyLocalBindError,
  ErrorTypes
} from 'exception'

let wxw = {
  keys: {
    session: 'session',
    studentInfo: 'studentInfo'
  },

  headerKeys: {
    session: 'X-User-Session-Key'
  },

  urls: {
    code2sessionUrl: "https://pkublackmarket.cn/api/v1/wechat/jscode2session",
    checkSessionUrl: "https://pkublackmarket.cn/api/v1/wechat/check_session",
    uploadUserInfoUrl: "https://pkublackmarket.cn/api/v1/wechat/user",
    studentInfoUrl: "https://pkublackmarket.cn/api/v1/student/"
  },

  checkSession() {
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success() { resolve() },
        fail() { reject(new SessionExpiredError()) }
      })
    })
  },

  getStorage(key) {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: key,
        success(data) { resolve(data.data) },
        fail() { reject() }
      })
    })
  },

  setStorage(key, value) {
    return new Promise((resolve, reject) => {
      wx.setStorage({
        key: key,
        data: value,
        success() { resolve(value) },
        fail() { reject() }
      })
    })
  },

  getSession() {
    return getStorage(this.keys.session)
  },

  setSession(session) {
    return setStorage(this.keys.session, session)
  },

  request(url, data, header = {}, type = 'json', method = 'GET') {
    let that = this
    let contentType = (type == 'form') ? 'application/x-www-form-urlencoded' : 'application/json'
    header['content-type'] = contentType

    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        success(data) {
          if (data.statusCode == 200) {
            resolve(data.data)
          } else {
            reject(data)
          }
        },
        fail() {
          reject(new NetworkError('Caused when request to ' + url))
        }
      })
    })
  },

  checkServerSession(session) {
    return this.request(this.urls.checkSessionUrl,
      { session: session },
      {}, 'form'
    )
  },

  getSessionHeader(session, header = {}) {
    header[this.headerKeys.session] = session
    return header
  },

  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success(data) { resolve(data.code) },
        fail() { reject(new LoginError()) }
      })
    })
  },

  loginCode2Session(code) {
    let that = this
    return this.request(this.urls.code2sessionUrl, { code: code }, {}, 'form')
      .then(data => {
        if (data.session_key) {
          return that.setStorage(that.keys.session, data.session_key)
        } else {
          return Promise.reject(new ServerError(data))
        }
      })
  },

  getUserInfo(session) {
    let that = this
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        withCredentials: true,
        success(res) { resolve({ session, res }) },
        fail() { reject(new UserInfoError()) }
      })
    })
  },

  uploadUserInfo(session, res) {
    let that = this
    return this.request(this.urls.uploadUserInfo,
      res,
      getSessionHeader(session),
      'json', 'PUT'
    )
      .then(data => {
        return Promise.resolve(session)
      })
      .catch(err => {
        if (err.type) { return Promise.reject(err) }   // NetworkError
        else if (err.statusCode && err.statusCode >= 500) { return Promise.reject(new ServerError(err)) }
        else return Promise.reject(new ServerError())
      })
  },

  getLocalStudentInfo(session) {
    return this.getStorage(this.keys.studentInfo)
      .catch(() => {
        return Promise.reject(new EmptyLocalBindError(session))
      })
  },

  setLocalStudentInfo(info) {
    return this.setStorage(this.keys.studentInfo, info)
  },

  fetchServerStudentInfo(session) {
    return this.request(this.urls.studentInfoUrl, {}, getSessionHeader(session), 'form')
  }
}