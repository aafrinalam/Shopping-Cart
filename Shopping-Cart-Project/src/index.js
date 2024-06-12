const express = require('express');
var bodyParser = require('body-parser');
const route = require('./routes/route.js');
const multer = require('multer')

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(multer().any())



const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://Aafrin77:omaJBV2vPYhwOS7f@cluster0.ekfff.mongodb.net/aafrin4", { useNewUrlParser: true })
    .then(() => console.log('mongodb is connected'))
    .catch(err => console.log(err))

app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});

