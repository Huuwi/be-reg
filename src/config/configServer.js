const cors = require("cors");
const express = require("express");
const cookieParser = require('cookie-parser')

function configServer(app) {
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }))
    app.use(cookieParser())

}


module.exports = configServer;
