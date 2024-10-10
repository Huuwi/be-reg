const cors = require("cors");
const express = require("express");
const cookieParser = require('cookie-parser');
let url = process.env.FONTEND_URL
const allowedOrigins = [url, 'http://localhost:5173', "http://localhost:8080"];

function configServer(app) {
    app.use(cors({
        origin: allowedOrigins,
        credentials: true
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
}

module.exports = configServer;
