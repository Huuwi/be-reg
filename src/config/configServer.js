const cors = require("cors");
const express = require("express");
const cookieParser = require('cookie-parser')

function configServer(app) {
    app.use(cors());
    app.use(cors({
        origin: '*', // Cho phép tất cả các nguồn
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }))
    app.use(cookieParser())

}


module.exports = configServer;
