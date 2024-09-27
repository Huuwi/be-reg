const Services = require("../controler/services.js")
const jwt = require("jsonwebtoken")
const fs = require("fs")


//create instance
const services = new Services()


class MiddleWare {


    checkInforAccessToken(req, res, next) {
        try {
            req.decodeAccessToken = undefined
            let client_access_token = req?.cookies?.at
            // console.log(client_access_token);

            if (!client_access_token) {
                res.status(403).json({
                    message: "unauthorized access!"
                })
                return "don't have accessToken"
            }

            let decodeAccessToken = services.verifyAccessToken(client_access_token)
            if (decodeAccessToken == "access token invalid!") {
                res.status(403).json({
                    message: "accessToken invalid"
                })
                return "accessToken invalid!"
            }
            //apply userData for next middleware
            req.decodeAccessToken = decodeAccessToken;
            next()

        } catch (error) {

            res.status(500).json({
                message: "have wrong!"
            })
            console.log("err when checkInforAccessToken");
            services.appendError500("err when checkInforAccessToken : " + error)

        }
    }

    checkIpAdress(req, res, next) {
        let ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
        //check ip in blacklist?
        if (services.checkIpInBlackList(ip)) {
            res.status(400).json({
                message: "fuck u ! want to cheat me ?? :))) lol",
            })
            return
        }
        next()
    }





}

module.exports = MiddleWare