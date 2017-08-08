let ErrorTypes = {
    SessionExpired: 1,
    Login: 2,
    Session: 3,
    UserInfo: 4,
    BindInfo: 5,
    Server: 6,
    Network: 7,
    EmptyLocalBind: 8
}

class SessionExpiredError extends Error {
    constructor(msg) {
        super(msg)
        this.message = msg
        this.type = 1
    }
}

class LoginError extends Error {
    constructor(msg) {
        super(msg)
        this.message = msg
        this.type = 2
    }
}

class SessionError extends Error {
    constructor(msg) {
        super(msg)
        this.message = msg
        this.type = 3
    }
}

class UserInfoError extends Error {
    constructor(msg) {
        super(msg)
        this.message = msg
        this.type = 4
    }
}

class BindInfoError extends Error {
    constructor(msg) {
        super(msg)
        this.message = msg
        this.type = 5
    }
}

class ServerError extends Error {
    constructor(msg) {
        super(msg)
        this.type = 6
    }
}

class NetworkError extends Error {
    constructor(msg) {
        super(msg)
        this.type = 7
    }
}

class EmptyLocalBindError extends Error {
    constructor(msg, session) {
        super(msg)
        this.type = 8,
        this.session = session
    }
}

module.exports = {
    SessionExpiredError,
    LoginError,
    SessionError,
    UserInfoError,
    BindInfoError,
    ServerError,
    NetworkError,
    EmptyLocalBindError,
    ErrorTypes
}