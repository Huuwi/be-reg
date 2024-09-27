const { connection } = require('../database/connection.js')
const Services = require('./services.js')
const MiddleWare = require('../middleware/middleware.js')
const bcrypt = require("bcryptjs")
const fs = require("fs")


const services = new Services()
const middleware = new MiddleWare()


class Controler {

    constructor() {

    }

    async registerAccount(req, res) {


        try {
            //get username and password from user
            let { userName, passWord, rePassWord } = req.body;


            //check blank?
            if (!userName || !passWord || !rePassWord) {
                res.status(400).json({
                    message: "username and password can't be blank"
                });
                return;
            }

            //check special character
            const regex = /^[a-zA-Z0-9]*$/
            if (!regex.test(userName) || !regex.test(passWord)) {
                res.status(400).json({
                    message: "username and password can't include special character"
                });
                return;
            }

            //check length
            if ((userName.length > 20) || (passWord.length > 20)) {
                res.status(400).json({
                    message: "username and password can't be over 20 charaters"
                });
                return;
            }

            //check password and rePassWord same?
            if (!(passWord === rePassWord)) {
                res.status(400).json({
                    message: `The re-entered password is not the same!`
                });
                return;
            }

            //check user is existed?
            let user = await connection.excuteQuery(`select * from user where username = '${userName}'`)
                .then((respone) => {
                    return respone
                })
                .catch((err) => {
                    throw new Error("err when get user from database -- api_register" + err)
                })

            console.log("user--------- : ", user);
            if (user?.length > 0) {
                res.status(400).json({
                    message: "username already existed"
                })
                return;
            }

            //hashed password
            let salt = bcrypt.genSaltSync(10);
            let hashedPass = bcrypt.hashSync(passWord, salt);

            //get timeCreate
            let today = new Date();
            let timeCreate = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();


            //referralCode

            let referralCode = services.sha256(userName + timeCreate, "hex");

            //new user
            let newUser = {
                userName, hashedPass, timeCreate, referralCode
            }

            //save to db
            await connection.excuteQuery(`insert into user (username,password,timeCreate,referralCode) Values ('${newUser.userName}', '${newUser.hashedPass}', '${newUser.timeCreate}', '${newUser.referralCode}' )`)
                .then((respone) => {
                    console.log(respone);
                    try {
                        fs.appendFileSync("./src/database/logRegisterDatabase.txt",
                            `${JSON.stringify(newUser)} \n \n`
                        )
                    } catch (error) {
                        throw new Error("err when append file -- api_register", error);
                    }
                })
                .catch((err) => {
                    throw new Error("err when append file -- api_register" + err)
                })

            //respone to client
            res.status(200).json({
                message: "succsessfully",
                newUser
            })
        } catch (error) {
            res.status(500).json({
                message: "have wrong!"
            });
            console.log(error);
            services.appendError500("err when register account : " + error)
        }

    }

    async loginAccount(req, res) {
        try {
            //get userName , passWord
            let { userName, passWord } = req.body;
            let ip = req.headers['x-real-ip'] || req.connection.remoteAddress;// ip address of client


            //check blank?
            if (!userName || !passWord) {
                res.status(400).json({
                    message: "username and password can't be blank"
                });
                return;
            }

            //check special character
            const regex = /^[a-zA-Z0-9]*$/
            if (!regex.test(userName) || !regex.test(passWord)) {
                res.status(400).json({
                    message: "username and password can't include special character"
                });
                return;
            }

            //check length
            if ((userName.length > 20) || (passWord.length > 20)) {
                res.status(400).json({
                    message: "username and password can't be over 20 charaters"
                });
                return;
            }


            //check user is existed?
            let user = await connection.excuteQuery(`select * from user where username = '${userName}'`)
                .then((respone) => {
                    return respone
                })
                .catch((err) => {
                    throw new Error("err when get user from database -- api_register" + err)
                })

            if (user?.length <= 0) {
                res.status(400).json({
                    message: "username not existed"
                })
                return;
            }
            //get user if existed
            user = user[0]
            console.log("user got from login", user);

            //check password
            if (!bcrypt.compareSync(passWord, user.passWord)) {
                res.status(400).json({
                    message: "password is not correct!!"
                })
                return;
            }


            //generator accesstoken and refreshtoken
            let access_token = services.generatorAccessToken({
                userId: user.userId
            })
            let refresh_token = services.generatorRefreshToken({
                userId: user.userId
            })


            //data for respone
            let { passWord: pw, timeCreate, ...userData } = user

            //set accestoken and refresh token
            res.cookie("at", access_token, { httpOnly: true });
            res.cookie("rt", refresh_token, { httpOnly: true });

            //fake cookie
            let fc = "bearer " + services.sha256(Date.now() + "cookie fake:))" + Math.random(), "base64")// fake cookie
            res.cookie("secur", fc, { httpOnly: true });

            //respone if success
            res.status(200).json({
                message: "login successfully!",
                userData,
                rf: refresh_token,
                fc
            })



        } catch (error) {
            res.status(500).json({
                message: "have wrong!"
            });
            console.log(error);
            services.appendError500("err when login account" + error)
        }

    }



    async getInforUser(req, res) {
        try {

            //get decoded accesstoken
            let decodeAccessToken = req.decodeAccessToken;
            let userId = decodeAccessToken.userId; //get userId


            //querry database

            let userData = await connection.excuteQuery(`select * from user where userId = ${userId}`)
                .then((data) => {
                    let { passWord, timeCreate, ...userData } = data[0];
                    return userData;
                })
                .catch((err) => {
                    throw new Error(err)
                })




            res.status(200).json({
                message: "ok",
                userData
            })
        } catch (error) {
            res.status(500).json({
                message: "have wrong!!"
            })
            console.log("error when getInforUser", error);
            services.appendError500("error when getInforUser : " + error)
        }
    }



    async getNewAccessToken(req, res) {
        try {
            //get ip
            let ip = req.headers['x-real-ip'] || req.connection.remoteAddress;

            //get random number and verifyCode
            let { rdn, verifyCode, rsn, rsne } = req?.body;

            //get refresh token
            let { rt } = req?.cookies;

            //check rt,rdn, verifyCode existed?
            if (!rt || !rdn || !verifyCode || !rsn || !rsne) {
                res.status(403).json({
                    message: "are you cheating me?"
                })
                services.logToCountBlackIpFile(ip)
                return
            }

            //get userId
            let { userId } = services.verifyRefreshToken(rt)
            if (!userId) {
                res.status(403).json({
                    message: "are you cheating me?"
                })
                services.logToCountBlackIpFile(ip)
                return
            }

            //query to db
            let user = await connection.excuteQuery(`select * from user where userId = '${userId}' `)
                .then((users) => {
                    return users[0]
                })
                .catch((err) => {
                    throw new Error("err when getNewAccessToken query db", err)
                })

            let { username } = user;
            let { passWord, timeCreate, ...userData } = user


            //sha256(username + randomnumber +  secrect_key)
            let secrect_key = process.env.SECRECT_KEY_VERIFY_CODE;
            let verifyCodeOfBackend = services.sha256(username + rdn + secrect_key);
            console.log(verifyCodeOfBackend);


            //get rsneOfBackend 
            let rsnOfBackend = services.decodeRSA(rsne)

            //check
            let check = (rsnOfBackend == rsn && verifyCodeOfBackend == verifyCode)


            if (!check) {
                res.status(403).json({
                    message: "are you cheating me? stop it RIGHTNOW!!"
                })
                services.logToCountBlackIpFile(ip)
                return
            }

            //new accesstoken
            let newAccessToken = services.generatorAccessToken({
                userId: user.userId
            })

            //set newaccesstoken
            res.cookie("at", newAccessToken, { httpOnly: true })

            // respone
            res.status(200).json({
                message: "ok",
            })

        } catch (error) {
            res.status(500).json({
                message: "have wrong!!"
            })
            console.log("error when getNewAccessToken", error);
            services.appendError500("error when getNewAccessToken : " + error)
        }
    }

    async loginHaui(req, res) {

        try {

            let { userNameHaui, passWordHaui } = req.body;


            let token_url = await services.getTokenUrlHaui(userNameHaui, passWordHaui);


            let data = await globalThis.ManageBrowsers.getInforFromTokenUrlHaui(token_url);

            let { name, Cookie, kverify } = data;

            let enKC = services.encodeAES(JSON.stringify({ Cookie, kverify }));


            res.cookie("enKC", enKC, { httpOnly: true })





            res.status(200).json({
                message: "ok", name
            })

        } catch (error) {

            res.status(500).json({
                message: "have wrong!!"
            })
            console.log("error when loginHaui", error);
            services.appendError500("error when loginHaui : " + error)

        }


    }



}


module.exports = Controler