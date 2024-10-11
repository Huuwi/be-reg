const { connection } = require('../database/connection.js')
const Services = require('./services.js')
const bcrypt = require("bcryptjs")
const fs = require("fs")


const services = new Services()


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
                .then(() => {
                    console.log("save new user to db : ", userName);
                    // try {
                    //     fs.appendFileSync("./src/logs/tmp/logRegisterDatabase.txt",
                    //         `${JSON.stringify(newUser)} \n \n`
                    //     )
                    // } catch (error) {
                    //     throw new Error("err when append file -- api_register", error);
                    // }
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
            // services.appendError500("err when register account : " + error)
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
            res.cookie("at", access_token, { httpOnly: true, maxAge: 3600000 * 12, sameSite: "none", secure: true, });
            res.cookie("rt", refresh_token, { httpOnly: true, maxAge: 3600000 * 24, sameSite: "none", secure: true, });

            //fake cookie
            let fc = "bearer " + services.sha256(Date.now() + "cookie fake:))" + Math.random(), "base64")// fake cookie
            res.cookie("secur", fc, { httpOnly: true, maxAge: 3600000 * 12, sameSite: "none", secure: true, });

            //respone if success
            res.status(200).json({
                message: "login successfully!",
                userData,
                rt: refresh_token,
                fc
            })



        } catch (error) {
            res.status(500).json({
                message: "have wrong!"
            });
            console.log(error);
            // services.appendError500("err when login account" + error)
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
            // services.appendError500("error when getInforUser : " + error)
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
                // services.logToCountBlackIpFile(ip)
                return
            }

            //get userId
            let { userId } = services.verifyRefreshToken(rt)
            if (!userId) {
                res.status(403).json({
                    message: "are you cheating me?"
                })
                // services.logToCountBlackIpFile(ip)
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

            let { passWord, timeCreate, ...userData } = user


            //sha256(username + randomnumber +  secrect_key)
            let secrect_key = process.env.SECRECT_KEY_VERIFY_CODE;
            let verifyCodeOfBackend = services.sha256(rdn + secrect_key);

            //get rsneOfBackend 
            let rsnOfBackend = services.decodeRSA(rsne)

            //check
            let check = (rsnOfBackend == rsn && verifyCodeOfBackend == verifyCode)


            if (!check) {
                res.status(403).json({
                    message: "are you cheating me? stop it RIGHTNOW!!"
                })
                // services.logToCountBlackIpFile(ip)
                return
            }

            //new accesstoken
            let newAccessToken = services.generatorAccessToken({
                userId: user.userId
            })

            //set newaccesstoken
            res.cookie("at", newAccessToken, { httpOnly: true, maxAge: 3600000 * 12, sameSite: "none", secure: true, })

            // respone
            res.status(200).json({
                message: "ok",
            })

        } catch (error) {
            res.status(500).json({
                message: "have wrong!!"
            })
            console.log("error when getNewAccessToken", error);
            // services.appendError500("error when getNewAccessToken : " + error)
        }
    }

    async loginHaui(req, res) {

        try {

            let { userNameHaui: studentCode, passWordHaui } = req.body;


            let token_url = await services.getTokenUrlHaui(studentCode, passWordHaui);


            let data = await globalThis.ManageBrowsers.getInforFromTokenUrlHaui(token_url);
            let nameHaui = data?.name;
            let Cookie = data?.Cookie;
            let kverify = data?.kverify;


            let enKC = services.encodeAES(JSON.stringify({ Cookie, kverify, studentCode, passWordHaui, nameHaui }));


            res.cookie("enKC", enKC, { httpOnly: true, maxAge: 3600000 * 2, sameSite: "none", secure: true, })




            res.status(200).json({
                message: "ok", nameHaui
            })

        } catch (error) {

            res.status(500).json({
                message: "have wrong!!"
            })
            console.log("error when loginHaui", error);
            // services.appendError500("error when loginHaui : " + error)

        }


    }

    async getListordered(req, res) {
        try {

            let enKC = req?.cookies?.enKC;

            if (!enKC) {
                res.status(400).json({
                    message: "can't find your Haui account , you should login Haui account again!"
                })
                return
            }

            let { Cookie, kverify } = JSON.parse(services.decodeAES(enKC))

            let data_ordered = await services.listOrdered(kverify, Cookie) || "none";



            res.status(200).json({
                message: "ok", data_ordered
            })



        } catch (error) {
            res.status(500).json({
                message: "have wrong!"
            })
            console.log("err when getListordered : ", error);
            // services.appendError500("error when getListordered : " + error)

        }
    }


    async removeClass(req, res) {

        try {

            let enKC = req?.cookies?.enKC;

            if (!enKC) {
                res.status(400).json({
                    message: "can't find your Haui account , you should login Haui account again!"
                })
                return
            }

            let { Cookie, kverify } = JSON.parse(services.decodeAES(enKC))

            let { classCode } = req.body;

            if (!classCode) {
                res.status(400).json({
                    message: "can't find classCode , try again!"
                })
                return
            }

            let result = await services.removeClass(kverify, Cookie, classCode) || "none";

            res.status(200).json({
                message: "ok",
                result
            })

        } catch (error) {

            console.log("err when removeClass : ", error);
            // services.appendError500("error when removeClass : " + error)
        }

    }
    async registerClass(req, res) {

        try {

            let enKC = req?.cookies?.enKC;



            if (!enKC) {
                res.status(400).json({
                    message: "can't find your Haui account , you should login Haui account again!"
                })
                return
            }

            let { Cookie, kverify, nameHaui, passWordHaui, studentCode } = JSON.parse(services.decodeAES(enKC));

            let { classCode } = req.body;

            if (!classCode) {
                res.status(400).json({
                    message: "can't find classCode , try again!"
                })
                return
            }


            let decodeAccessToken = req.decodeAccessToken;
            let userId = decodeAccessToken.userId; //get userId


            //querry database

            let user = await connection.excuteQuery(`select * from user where userId = ${userId}`)
                .then((data) => {
                    return data[0];
                })
                .catch((err) => {
                    throw new Error(err)
                })
            let balance = user?.balance;

            if (!balance) {
                res.status(400).json({
                    message: "balance invalid!!"
                })
                return
            }
            balance = Number(balance)
            if (balance < 49) {
                res.status(400).json({
                    message: "balance not enough!"
                })
                return
            }


            let result = await services.addClass(kverify, Cookie, classCode) || "none";



            if (result.Message == "Gửi đơn đăng ký thành công, vui lòng đợi kết quả xử lý!") {

                res.status(200).json({
                    message: "ok",
                    result,

                })

                await connection.excuteQuery(`update user set balance = ${balance - 49} where userId = ${userId}`)
                    .then(() => {
                        console.log("userId : " + userId + " vừa dky môn học");
                    })
                    .catch((err) => {
                        throw new Error(err)
                    })




            } else {
                res.status(500).json({
                    message: "have wrong!",
                    result
                })
            }


        } catch (error) {

            console.log("err when registerClass : ", error);
            // services.appendError500("error when registerClass : " + error)
        }

    }


    async getInforClass(req, res) {

        try {

            let enKC = req?.cookies?.enKC;

            if (!enKC) {
                res.status(400).json({
                    message: "can't find your Haui account , you should login Haui account again!"
                })
                return
            }

            let { Cookie, kverify } = JSON.parse(services.decodeAES(enKC));

            let { id } = req.body;

            if (!id) {
                res.status(400).json({
                    message: "can't find id subject , try again!"
                })
                return
            }


            let result = await services.getInforClass(kverify, Cookie, id) || "none";

            res.status(200).json({
                message: "ok",
                result
            })


        } catch (error) {

            console.log("err when getInforClass : ", error);
            // services.appendError500("error when getInforClass : " + error)
        }


    }



    //transaction
    async createPaymentLink(req, res) {

        try {

            let { amount, description } = req.body

            if (!amount || !description) {
                res.status(400).json({
                    message: "missing data!"
                })
                return
            }
            let decodeAccessToken = req.decodeAccessToken;
            let userId = decodeAccessToken.userId; //get userId

            let userData = await connection.excuteQuery(`select * from user where userId = ${userId}`)
                .then((data) => {
                    let { passWord, timeCreate, ...userData } = data[0];
                    return userData;
                })
                .catch((err) => {
                    throw new Error(err)
                })


            if (!userData) {
                res.status(401).json({
                    message: "missing data! login again!"
                })
                return
            }

            let curCount = fs.readFileSync("./src/logs/countIdtrans.txt", "utf-8")
            console.log(curCount);

            if (curCount) {
                curCount = JSON.parse(curCount).count
                curCount++;
                fs.appendFileSync("./src/logs/countIdtrans.txt", JSON.stringify({ count: curCount }))
            }

            let returnUrl = process.env.FONTEND_URL + "/paymentSuccess"
            let cancelUrl = process.env.FONTEND_URL + "/dashBoard"



            let dataFromCreatePaymentLink = await services.create_payment_link({ orderCode: curCount, amount, description, cancelUrl, returnUrl })

            if (!dataFromCreatePaymentLink?.data?.paymentLinkId) {
                res.status(500).json({
                    message: "chưa thể khởi tạo giao dịch"
                })
                return
            }


            res.status(200).json({
                message: "ok",
                dataFromCreatePaymentLink
            })

        } catch (error) {
            res.status(500).json({
                message: "have wrong!"
            })
            console.log("err when createPaymentLink : ", error);
            // services.appendError500("error when createPaymentLink : " + error)

        }


    }


    async checkPayment(req, res) {
        try {


            let decodeAccessToken = req.decodeAccessToken;
            let userId = decodeAccessToken.userId; //get userId

            let { edt } = req.body // = RSAENCODE(JSON.stringify({ transId, username, Referral })) 


            let userData = await connection.excuteQuery(`select * from user where userId = ${userId}`)
                .then((data) => {
                    let { passWord, timeCreate, ...userData } = data[0];
                    return userData;
                })
                .catch((err) => {
                    throw new Error(err)
                })

            if (!edt || !userData) {
                res.status(400).json({
                    message: "missing data!!"
                })
                return
            }

            let dataCheckPayment = JSON.parse(services.decodeRSA(edt))

            let checkPayment = await services.checkPayMent(dataCheckPayment.transId)


            //kiểm tra status có thành công hay không ?


            //nếu không thành công trả về thanh toán không thành công , return


            //nếu thành công , kiểm tra xem bảng giao dịch đã có giao dịch nào có Id như này chưa?



            //nếu có transid như này rồi , thì trả về , giao dịch này đã được thực hiện trước đó , return



            //nếu chưa có transid như này , thì cộng tiền vào user , lưu trans vào bảng giao dịch các thông tin sau :  transid , amount , userId, thời gian giao dịch



            // sau đó tìm kiếm user có mã giới thiệu như đã được gửi lên



            //nếu không có user thì không cộng , kết thúc làm việc


            //nếu có thì lấy user đầu tiên, so sánh mã giới thiệu từ client và thuộc tính mã giới thiệu của user (để tránh bị tấn công sql injection) nếu == thì cộng , không thì return





            res.status(200).json({
                message: "ok",
                checkPayment
            })


        } catch (error) {

        }
    }

}


module.exports = Controler