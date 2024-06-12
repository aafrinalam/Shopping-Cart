const productModel = require("../model/productModel")
const validator = require("./validations")
const aws = require("./awsController")
const currencySymbol = require('currency-symbol-map')


const createProduct = async function (req, res) {
    try {

        let files = req.files;
        let productBody = req.body;

        if (!validator.isValidRequestBody(productBody)) {
            return res.status(400).send({ status: false, message: 'Please provide valid product body' })
        }

        let { title, description, productImage, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = productBody

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is required' })
        }
        const titleAleadyUsed = await productModel.findOne({ title })
        if (titleAleadyUsed) {
            return res.status(400).send({ status: false, message: `${title} is alraedy in use. Please use another title` })
        }

        if (!validator.isValidRequestBody(files)) {
            return res.status(400).send({ status: false, message: 'Product Image is required' })
        }

        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: 'Description is required' })
        }

        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, message: 'Price is required' })
        }

        if (!validator.isValid(currencyId)) {
            return res.status(400).send({ status: false, message: 'currencyId is required' })
        }

        if (currencyId != 'INR') {
            return res.status(400).send({ status: false, message: 'currencyId should be INR' })
        }

        if (!validator.isValid(currencyFormat)) {
            currencyFormat = currencySymbol('INR')
        }
        currencyFormat = currencySymbol('INR')


        if (style) {
            if (!validator.validString(style)) {
                return res.status(400).send({ status: false, message: 'style is required' })
            }
        }

        if (installments) {
            if (!validator.isValid(installments)) {
                return res.status(400).send({ status: false, message: 'installments required' })
            }
        }
        if (installments) {
            if (!validator.validInstallment(installments)) {
                return res.status(400).send({ status: false, message: `installments can't be a decimal number` })
            }
        }

        if (isFreeShipping) {
            if (!(isFreeShipping != true)) {
                return res.status(400).send({ status: false, message: 'isFreeShipping must be a boolean value' })
            }
        }

        productImage = await aws.uploadFile(files[0])

        const productData = { title, description, productImage, price, currencyId, currencyFormat: currencyFormat, isFreeShipping, style, availableSizes, installments, productImage: productImage }
        
        if (availableSizes) {
            let size = availableSizes.split(",").map(x => x.trim())

            for (let i = 0; i < size.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size[i]))) {
                    return res.status(400).send({ status: false, message: `availableSizes should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"].join(', ')}` })
                }
            }
            if (size) {
                productData.availableSizes = size
            }
        }
        const saveProductDetails = await productModel.create(productData)
        return res.status(201).send({ status: true, message: 'Successfully saved product details', data: saveProductDetails })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message})
    }
}

// getAllProducts
const getProductbyQuery = async function(req,res) {
    try {
        const queryParams = req.query
        const body = req.body

        if(validator.isValidRequestBody(body)) {
            return res.status(400).send({ status: false, message: `Don't you understand about query params` })
        }

        const { title, priceGreaterThan, priceLessThan, priceSort, size } = queryParams

        const product = {}

        if(size) {

            const searchSize = await productModel.find({availableSizes: size, isDeleted: false}).sort({price: priceSort})

            if(searchSize.length !== 0) {
                return res.status(200).send({ status: true, message: 'Success', data: searchSize})
            }
            else {
                return res.status(400).send({status: false, message: `product not found with this ${size}`})
            }
        }

        if(title) {
            const searchName = await productModel.find({title: {$regex: title}, isDeleted: false}).sort({price: priceSort})

            if(searchName.length !== 0) {
                return res.status(200).send({status: true, message: 'Success', data: searchName})
            }
            else {
                return res.status(400).send({status: false, message: `product not found with this ${title}`})
            }
        }

        if(priceGreaterThan) {
            product["$gt"] = priceGreaterThan// product.price = {$gte: priceGreaterThan}
        }

        if(priceLessThan) {
            product["$lt"] = priceLessThan // product.price = {$lte: priceLessThan}
        }

        if(priceLessThan || priceGreaterThan) {
            const searchPrice = await productModel.find({price: product, isDeleted: false}).sort({price: priceSort})

            if(searchPrice.length !== 0) {
                return res.status(200).send({status: true, message: 'Success', data: searchPrice})
            }
            else {
                return res.status(400).send({status: false, message: 'product not found with this range' })
            }                
        }

        const Products = await productModel.find({data: product, isDeleted: false}).sort({price: priceSort})
        if(Products !== 0) {
            return res.status(200).send({status: true, message: 'Success', count: Products.length, data: Products})
        }
        else {
            return res.status(404).send({status: false, message: 'No product exist in database'})
        }
    }
    catch (error) {
        res.status(500).send({status: false, error: error.message })
    }
}


const getProduct = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!validator.isValidRequestBody(productId)) {
            return res.status(400).send({ status: false, msg: "please provide productId" })
        }

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is not a valid product id ` })
        }

        let getProductData = await productModel.findById(productId)

        if (!getProductData) {
            return res.status(404).send({ status: false, message: "Product is Not Found" })
        }

        return res.status(200).send({ status: true, msg: "Product Details", data: getProductData })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}




const updateProduct = async function (req, res) {
    try {
        const productId = req.params.productId
        const data = req.body

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid Product id" })
        }

        if (!validator.isValidRequestBody(data)) {
            if (!(validator.isValidRequestBody(req.files)))
                return res.status(400).send({ status: false, msg: "Please enter Data to be updated" })
        }

        let { title, description, price, currencyId, currencyFormat, availableSizes } = data

        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: true })
        if (checkProduct) {
            return res.status(400).send({ status: false, msg: "Product Already Deleted" })
        }

        if (title) {
            if (!validator.isValid(title)) {
                return res.status(400).send({ status: false, msg: "Please enter title" })
            }

            const titleUsed = await productModel.findOne({ title })
            if (titleUsed) {
                return res.status(400).send({ status: false, msg: "title must be unique" })
            }
        }

        if (description) {
            if (!validator.isValid(description)) {
                return res.status(400).send({ status: false, msg: "Please enter description" })
            }
        }

        if (price) {
            if (!validator.isValid(price)) {
                return res.status(400).send({ status: false, msg: "Please enter Price" })
            }
        }

        if (currencyId) {
            if (!validator.isValid(currencyId)) {
                return res.status(400).send({ status: false, msg: "Please enter currencyId" })
            }

            if (!validator.isINR(currencyId)) {
                return res.status(400).send({ status: false, msg: "Currencr Id must be INR" })
            }
        }

        if (currencyFormat) {
            if (!validator.isValid(currencyFormat)) {
                return res.status(400).send({ status: false, msg: "Please enter currency format" })
            }

            if (!validator.isRs(currencyFormat)) {
                return res.status(400).send({ status: false, msg: "Currency Format must be Rs" })
            }
        }

        if (availableSizes) {
            if (!validator.isValid(availableSizes)) {
                return res.status(400).send({ status: false, msg: "Please enter available sizes" })
            }

            if (!validator.isValidSizes(availableSizes)) {
                return res.status(400).send({ status: false, msg: "Available Sizes should be from ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL']" })
            }
        }

        if (req.files) {
            let files = req.files
            if (files && files.length > 0) {
                var uploadedFileURL = await aws.uploadFile(files[0])
            }
        }

        const productUpdated = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: data }, { new: true })
        if (!productUpdated) {
            return res.status(404).send({ status: false, msg: "No Such Product exists" })
        }

        productUpdated["productImage"] = uploadedFileURL

        return res.status(200).send({ status: true, msg: "Data Updated Succesfully", data: productUpdated })
    }

    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message })
    }

}



const deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!productId) {
            return res.status(400).send({ status: false, msg: "please provide productId" })
        }

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid Product id" })
        }

        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: true })
        if (checkProduct) {
            return res.status(400).send({ status: false, msg: "Product Already Deleted" })
        }
        else {
            let deleteNow = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: Date.now() }, { new: true })
            if (deleteNow == null) {
                return res.status(404).send({ status: false, msg: "Product Not Exists" });
            }
            else {
                return res.status(200).send({ status: true, msg: "Product Deleted Successfully", data: deleteNow })
            }
        }

    }
    catch (error) {
        return res.status(500).send({ msg: "Error", error: error.message })
    }

}


module.exports = { createProduct, getProductbyQuery, getProduct, updateProduct, deleteProduct, }