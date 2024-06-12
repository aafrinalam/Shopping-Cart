const mongoose = require('mongoose')

const isValidPincode = function (value) {
    if (!isNaN(value) && value.toString().length == 6) return true
}

const isValidSizes = (availableSizes) => {
    return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) !== -1

}

const isINR = (currencyId) => {
    return ["INR"].indexOf(currencyId) !== -1

}

const isRs = (currencyFormat) => {
    return ["Rs"].indexOf(currencyFormat) !== -1

}

let char=function(value){
    return /^[A-Za-z\s]+$/.test(value)
}


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
};
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}

const validString = function (value) {
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const validInstallment = function isInteger(value) {
    return value % 1 == 0;
}

const validQuantity = function isInteger(value) {
    if (value < 1) return false
    if (isNaN(Number(value))) return false
    if (value % 1 == 0) return true
}

const isvalidNum = function(value) {
    if (!/^[0-9]+$/.test(value)) {
        return false
    }
    return true
}

const isValidremoveProduct = function(value) {
    return [0,1].indexOf(value) !== -1
}

const isValidStatus = function(value) {
    return ["pending", "completed", "cancelled"].indexOf(value) !== -1
}


module.exports.isValid = isValid
module.exports.isValidremoveProduct = isValidremoveProduct
module.exports.isValidStatus = isValidStatus
module.exports.isvalidNum = isvalidNum
module.exports.char = char
module.exports.isValidPincode = isValidPincode
module.exports.isValidRequestBody = isValidRequestBody
module.exports.isValidObjectId = isValidObjectId
module.exports.validString = validString
module.exports.validInstallment = validInstallment
module.exports.validQuantity = validQuantity
module.exports.isValidSizes = isValidSizes
module.exports.isINR = isINR
module.exports.isRs = isRs