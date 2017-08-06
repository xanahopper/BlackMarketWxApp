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

module.exports = {
    SessionExpiredError: SessionExpiredError,
    LoginError,
    SessionError,
    UserInfoError,
    BindInfoError: BindInfoError
}