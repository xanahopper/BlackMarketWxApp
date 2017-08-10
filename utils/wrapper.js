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
  ResponseError,
  NoChangeError,
  EmptyError,
  StorageFailedError,
  ErrorTypes,
} from 'exception'


let wxw = {
  keys: {
    session: 'session',
    studentInfo: 'studentInfo',
    userInfo: 'userInfo'
  },

  headerKeys: {
    session: 'X-User-Session-Key'
  },

  urls: {
    code2sessionUrl: "https://pkublackmarket.cn/api/v1/wechat/jscode2session",
    checkSessionUrl: "https://pkublackmarket.cn/api/v1/wechat/check_session",
    uploadUserInfoUrl: "https://pkublackmarket.cn/api/v1/wechat/user",
    studentInfoUrl: "https://pkublackmarket.cn/api/v1/student/",
    verifyCodeUrl: "https://pkublackmarket.cn/api/v1/student/register"
  },

  /**
   * 检查微信自身Session
   * @returns Promise
   * @throws SessionExpiredError
   */
  checkSession() {
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success() {
          resolve()
        },
        fail() {
          reject(new SessionExpiredError())
        }
      })
    })
  },

  getStorage(key) {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: key,
        success(data) {
          resolve(data.data)
        },
        fail() {
          reject(new EmptyError())
        }
      })
    })
  },

  setStorage(key, value) {
    return new Promise((resolve, reject) => {
      wx.setStorage({
        key: key,
        data: value,
        success() {
          resolve(value)
        },
        fail() {
          reject(new StorageFailedError())
        }
      })
    })
  },

  /**
   * 获取本地储存的3rd-session
   * @returns {Promise<session>}
   * @throws {SessionError}
   */
  getSession() {
    return this.getStorage(this.keys.session)
      .catch(() => {
        console.log(new SessionError())
        return Promise.reject(new SessionError())
      })
  },

  setSession(session) {
    return this.setStorage(this.keys.session, session)
  },

  /**
   * 网络请求
   * @param {string} url - 请求地址
   * @param {object} data - 请求数据
   * @param {object} header - 请求头部
   * @param {string} type - 请求数据格式，默认为'json'，有效内容为'json', 'form'
   * @param {string} method - 请求方法，默认为'GET'，有效内容与微信request相同
   * @returns {Promose<Object>}
   * @throws {ResponseError}
   * @throws {NetworkError}
   */
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
            reject(new ResponseError('', data))
          }
        },
        fail() {
          reject(new NetworkError('Caused when request to ' + url))
        }
      })
    })
  },

  /**
   * 检查3rd-session有效性
   * @param {string} session - 3rd-session
   * @returns {Promise<Object>}
   * @throws {ResponseError}
   * @throws {NetworkError}
   */
  checkServerSession(session) {
    return this.request(this.urls.checkSessionUrl,
      {},
      this.getSessionHeader(session), 'form'
    )
      .then(() => Promise.resolve(session))
      .catch(err => Promise.reject(err))
  },

  getSessionHeader(session, header = {}) {
    header[this.headerKeys.session] = session
    return header
  },

  /**
   * 微信登录
   * @returns {Promise<String>} 登录Code
   * @throws {LoginError}
   */
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success(data) {
          resolve(data.code)
        },
        fail() {
          reject(new LoginError())
        }
      })
    })
  },

  /**
   * 使用登录Code换取3rd-session
   * @param {String} code - 登录Code
   * @returns {Promise<String>} 3rd-session
   * @throws {ServerError}
   */
  loginCode2Session(code) {
    let that = this
    return this.request(this.urls.code2sessionUrl, { code: code }, {}, 'form')
      .then(data => {
        if (data.session_key) {
          return that.setSession(data.session_key)
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
        success(res) {
          resolve({ session: session, data: res })
        },
        fail() {
          reject(new UserInfoError())
        }
      })
    })
  },

  compareUserInfo(res) {
    let that = this
    return that.getStorage(that.keys.userInfo)
      .then(info => {
        if (JSON.stringify(info) != JSON.stringify(res.userInfo)) {
          return Promise.resolve(res)
        } else {
          return Promise.reject(new NoChangeError())
        }
      })
      .catch(err => {
        if (err && err.type && err.type == ErrorTypes.NoChange) {
          return Promise.reject(err)
        } else {
          return Promise.resolve(res)
        }
      })    // 本地不存在时，一定未上传
  },

  uploadUserInfo(session, result) {
    let that = this
    return this.compareUserInfo(result)
      .then(res => {
        return that.request(this.urls.uploadUserInfoUrl,
          res,
          that.getSessionHeader(session),
          'json', 'PUT'
        )
          .then(data => {
            that.setStorage(that.keys.userInfo, res.userInfo).then()
            return Promise.resolve(session)
          })
          .catch(err => {
            if (err.type && !err.data) { return Promise.reject(err) }   // NetworkError
            else if (err.data.statusCode && err.data.statusCode >= 500) { return Promise.reject(new ServerError(err)) }
            else return Promise.reject(new ServerError())
          })
      })
      .catch(err => {
        if (err.type && err.type == ErrorTypes.NoChange) {
          return Promise.resolve(session)
        } else {
          return Promise.reject(err)
        }
      })
  },

  getLocalStudentInfo(session) {
    return this.getStorage(this.keys.studentInfo)
      .catch(() => {
        return Promise.reject(new EmptyLocalBindError('', session))
      })
  },

  setLocalStudentInfo(info) {
    return this.setStorage(this.keys.studentInfo, info)
  },

  fetchServerStudentInfo(session) {
    console.log('fetch Session: ' + session)
    return this.request(this.urls.studentInfoUrl, {}, this.getSessionHeader(session), 'form')
      .catch(err =>
        Promise.reject(new BindInfoError())
      )
  },

  getVerifyCode(session, mobile) {
    return this.request(this.urls.verifyCodeUrl, 
      { mobile },
      this.getSessionHeader(session), 'json', 'POST')
  },

  uploadStudentInfo(session, info, method = 'POST') {
    return this.request(this.urls.studentInfoUrl, info,
      this.getSessionHeader(session), 'json', method)
  }
}


console.log(new SessionError())

module.exports = wxw