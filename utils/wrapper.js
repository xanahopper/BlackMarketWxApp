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

let baseUrl = "https://dev.pkublackmarket.cn"

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
    code2sessionUrl: baseUrl + "/api/v1/wechat/jscode2session",
    checkSessionUrl: baseUrl + "/api/v1/wechat/check_session",
    uploadUserInfoUrl: baseUrl + "/api/v1/wechat/user",
    studentInfoUrl: baseUrl + "/api/v1/student/",
    verifyCodeUrl: baseUrl + "/api/v1/student/register",

    courseUrl: baseUrl + "/api/v1/course/",
    postUrl: baseUrl + "/api/v1/course/post/",
    myPostUrl: baseUrl + "/api/v1/student/post",
    viewContractUrl: baseUrl + "/api/v1/course/post/viewcount",

    sharedPostUrl: baseUrl + "/api/v1/course/post/",
    shareNoticeUrl: baseUrl + "/api/v1/post/share"
  },

  showMessage(msg, title) {
    if (msg) {
      let options = {
        content: msg,
        showCancel: false
      }
      if (title) data.title = title
      wx.showModal(options)
    }
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
      .catch(err => Promise.reject(SessionExpiredError()))
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

  compareUserInfo(res, check) {
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
        if (err && err.type && err.type == ErrorTypes.NoChange && check) {
          return Promise.reject(err)
        } else {
          return Promise.resolve(res)
        }
      })    // 本地不存在时，一定未上传
  },

  uploadUserInfo(session, result, check = false) {
    let that = this
    return this.compareUserInfo(result, check)
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
  },

  getCourses(session) {
    return this.request(this.urls.courseUrl, {}, this.getSessionHeader(session))
  },
  
  getPostList(session, order = 0, start = 0, limit = 10, supply = 0, demand = 0, closed = 1) {
    return this.request(this.urls.postUrl, {order, start, limit, supply, demand, closed}, this.getSessionHeader(session),
      'form')
  },

  getPost(session, id) {
    return this.request(this.urls.postUrl + id, {}, this.getSessionHeader(session))
  },

  createPost(session, data) {
    return this.request(this.urls.postUrl, data, this.getSessionHeader(session), 'json', 'POST')
  },

  editPost(session, data, id) {
    return this.request(this.urls.postUrl + id, data, this.getSessionHeader(session), 'json', 'PUT')
  },

  getMyPost(session, data) {
    return this.request(this.urls.myPostUrl, data, this.getSessionHeader(session), 'form')
  },

  putPostStatus(session, post_id, status) {
    return wxw.request(this.urls.postUrl + post_id + '/status', {
      status
    }, this.getSessionHeader(session), 'json', 'PUT')
  },

  viewPostContract(session, post_id) {
    return this.request(this.urls.viewContractUrl, {post_id}, this.getSessionHeader(session), 'json', 'PUT')
  },

  getViewCount(session) {
    return this.request(this.urls.viewContractUrl, {}, this.getSessionHeader(session))
  },

  getSharedPost(fuzzy_post_id) {
    return this.request(this.urls.sharedPostUrl + fuzzy_post_id, {}, {})
  },

  postShare(post_id, post_type, student_id) {
    let data = {
      post_id: Number.parseInt(post_id),
      post_type: Number.parseInt(post_type)
    }
    if (student_id) data['student_id'] = student_id
    return this.request(this.urls.shareNoticeUrl, data, {}, 'json', 'POST')
  }
}


console.log(new SessionError())

module.exports = wxw