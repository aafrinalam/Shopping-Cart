const express = require('express');

const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
const middleWare = require('../middleware/authentication')



const router = express.Router();


//  first feature apis

router.post("/register", userController.register);

router.post("/login", userController.loginUser);

router.get("/user/:userId/profile", middleWare.authenticateUser, userController.getUser);

router.put("/user/:userId/profile", middleWare.authenticateUser, userController.updateProfile);

// second feature apis 

router.post("/products", productController.createProduct);

router.get("/products", productController.getProductbyQuery);

router.get("/products/:productId", productController.getProduct);

router.put("/products/:productId", productController.updateProduct);

router.delete("/products/:productId", productController.deleteProduct);

// third featur apis 

router.post("/users/:userId/cart", middleWare.authenticateUser, cartController.createCart);

router.put("/users/:userId/cart", middleWare.authenticateUser, cartController.updateCart);

router.get("/users/:userId/cart", middleWare.authenticateUser, cartController.getCart);

router.delete("/users/:userId/cart", middleWare.authenticateUser, cartController.deleteCart);

// fourth feature apis

router.post("/users/:userId/orders", middleWare.authenticateUser, orderController.createOrder);

router.put("/users/:userId/orders", middleWare.authenticateUser, orderController.updateOrder);


module.exports = router;


