let ErrorTypes = {
    SessionExpired: 1,
    Login: 2,
    Session: 3,
    UserInfo: 4,
    BindInfo: 5,
    Server: 6,
    Network: 7,
    EmptyLocalBind: 8,
    Response: 9,
    NoChange: 10,
    Empty: 11,
    StorageFailed: 12
}

class SessionExpiredError extends Error {
    constructor(msg) {
        super(msg)
        this.type = 1
    }
}

class LoginError extends Error {
    constructor(msg) {
        super(msg)
        this.type = 2
    }
}

class SessionError extends Error {
    constructor(msg) {
        super(msg)
        this.type = 3
    }
}

class UserInfoError extends Error {
    constructor(msg) {
        super(msg)
        this.type = 4
    }
}

class BindInfoError extends Error {
    constructor(msg) {
        super(msg)
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
        this.type = 8
        this.session = session
    }
}

class ResponseError extends Error {
    constructor(msg, data) {
        super(msg)
        this.type = 9
        this.data = data
    }
}

class NoChangeError extends Error {
    constructor(msg) {
        super(msg)
        this.type = 10
    }
}

class EmptyError extends Error {
    constructor(msg) {
        super(msg)
        this.type = 11
    }
}

class StorageFailedError extends Error {
    constructor(msg) {
        super(msg)
        this.type = 12
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
    ResponseError,
    NoChangeError,
    EmptyError,
    StorageFailedError,
    ErrorTypes
}