const jwt = require("jsonwebtoken")



let authenticateUser = function (req, res, next) {
    try {
        token = req.headers["authorization"]
        if (!token) {
            return res.status(401).send({ status: false, message: "token required" })
        }
        if (token.startsWith('Bearer')) {
            token = token.slice(7, token.length)
        }

        let decodedToken = jwt.verify(token, 'Group29', { ignoreExpiration: true })
        // console.log(decodedToken)



        if (!decodedToken) {
            return res.status(401).send({ status: false, message: "token is invalid" })
        }

        let timeToExpire = Math.floor(Date.now() / 1000)
        if (decodedToken.exp < timeToExpire) {
            return res.status(401).send({ status: false, msg: "token is expired please login again" })
        }

        req.userId = decodedToken._id
        next()
    } catch (error) {
        res.status(500).send({ status: false, ERROR: error.message })
    }
}

module.exports.authenticateUser = authenticateUser