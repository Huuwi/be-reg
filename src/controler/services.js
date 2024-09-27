const jwt = require("jsonwebtoken")
const fs = require("fs")
const crypto = require("crypto")
const axios = require('axios');
const qs = require('qs');


class Services {

    generatorAccessToken(payLoad, access_token_key = process.env.SECRECT_KEY_JWT_ACCESS_TOKEN) {
        try {
            return jwt.sign(
                payLoad,
                access_token_key,
                { expiresIn: process.env.EXPIRESIN_ACCESS_TOKEN }
            );
        } catch (error) {
            console.log("err when generator AccessToken", error);
            return "none"
        }
    }
    generatorRefreshToken(payLoad, refresh_token_key = process.env.SECRECT_KEY_JWT_refresh_TOKEN) {
        try {
            return jwt.sign(
                payLoad,
                refresh_token_key,
                { expiresIn: process.env.EXPIRESIN_REFRESH_TOKEN }
            );
        } catch (error) {
            console.log("err when generator refreshToken", error);
            return "none"
        }
    }
    verifyAccessToken(access_token, access_token_key = process.env.SECRECT_KEY_JWT_ACCESS_TOKEN) {
        try {
            return jwt.verify(access_token, access_token_key)
        } catch (error) {
            console.log("err when verify AccessToken", error);
            return "access token invalid!"
        }
    }
    verifyRefreshToken(access_token, refresh_token_key = process.env.SECRECT_KEY_JWT_refresh_TOKEN) {
        try {
            return jwt.verify(access_token, refresh_token_key)
        } catch (error) {
            console.log("err when verify RefreshToken invalid!");
            return "refresh token invalid!"
        }
    }

    appendError500(error) {
        let today = new Date();
        let timeCreate = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        fs.appendFileSync('./src/errServer.txt', JSON.stringify({
            time: timeCreate,
            error
        }))
    }

    sha256(string, typeHash = "hex") { // base64 base64url binary hex
        try {
            let sha256 = crypto.createHash("sha256")
            return sha256.update(string).digest(typeHash)
        } catch (error) {
            console.log("err when sha256 : ", error);
            this.appendError500("err when sha256 : ", error)
        }
    }

    checkIpInBlackList(ip) {
        let listBlackips = fs.readFileSync("./src/blackListIps.txt", "utf-8").split("\n")
        return listBlackips.includes(ip);

    }

    async logToCountBlackIpFile(ip) {

        try {
            let listIpCountString = fs.readFileSync("./src/countBlackList.txt", "utf-8").split("\n")
            let listIpCounts = []
            let ipFound

            for (let i = 0; i < listIpCountString.length; i++) {
                try {
                    listIpCounts.push(JSON.parse(listIpCountString[i]))

                } catch (error) {
                    console.log("error when logToCountBlackIpFile JSON.parse");
                    continue
                }
            }

            for (let i = listIpCounts.length - 1; i >= 0; i++) {
                if (listIpCounts[i]?.ip === ip) {
                    ipFound = listIpCounts[i];
                    break;
                }
            }
            console.log(ipFound);
            if (!ipFound) {
                fs.appendFileSync("./src/countBlackList.txt", JSON.stringify({
                    ip, count: 0
                }) + "\n")
                return
            } else {
                if (ipFound.count > 0) {
                    fs.appendFileSync("./src/blackListIps.txt", ip + "\n");
                    return
                }
                fs.appendFileSync("./src/countBlackList.txt", JSON.stringify({
                    ip, count: ipFound.count + 1
                }) + "\n")
                return
            }
        } catch (error) {
            console.log("err when verify logToCountBlackIpFile", error);
            return "access token invalid!"
        }
    }


    decodeRSA(encryptedData) {
        try {
            const privateKey = fs.readFileSync('./src/private.pem', 'utf8');

            try {
                // Giải mã dữ liệu sử dụng private key
                const decryptedData = crypto.privateDecrypt(
                    {
                        key: privateKey,
                        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // Sử dụng OAEP padding
                        oaepHash: 'sha256', // Đảm bảo sử dụng SHA-256 cho OAEP
                    },
                    Buffer.from(encryptedData, 'base64') // Convert dữ liệu mã hóa về Buffer
                );

                // Trả về dữ liệu đã giải mã
                return decryptedData.toString()
            } catch (err) {
                throw new Error(err)
            }



        } catch (error) {
            console.log("decode RSA false" + error);
            return "decode RSA false" + error
        }
    }

    async getTokenUrlHaui(userNameHaui, passWordHaui) {
        try {

            let cookie1 = 'onehauii=';
            let cookie2 = 'TrxL4TX2mjqMQ1pKsA7y4inFGqk_=';
            const url = 'https://one.haui.edu.vn/loginapi/sv';

            // Dữ liệu POST
            const data = {
                '__VIEWSTATE': '/wEPDwUKLTU5NDQwMzI4Mw9kFgJmDxYCHgZhY3Rpb24FDC9sb2dpbmFwaS9zdmRkLUQPG6EM9UmIcR2BbVVHKFcrpMPq+5jLkhNeQ7F2IUo=',
                '__VIEWSTATEGENERATOR': 'C2EE9ABB',
                '__EVENTVALIDATION': '/wEdAAS5z3MTDMAIrXv9EuOCbfKV5nBuGc9m+5LxaP9y8LjuWbIOqgbU3uDqsEyVllp/jwNkBC2CEAipMbZPtKd79PAx5foOw1a7snIeIlNlqcQMoCcgW0aE55vl9Kb0YUvX8wg=',
                'ctl00$inpUserName': userNameHaui, // Thay bằng tên người dùng thực tế
                'ctl00$inpPassword': passWordHaui, // Thay bằng mật khẩu thực tế
                'ctl00$butLogin': 'Đăng nhập'
            };

            // Khởi tạo axios instance với cấu hình tùy chỉnh
            const axiosInstance = axios.create({
                headers: {
                    'Referer': 'https://one.haui.edu.vn/loginapi/sv',
                },
                maxRedirects: 0 // Ngăn chặn axios tự động làm theo chuyển hướng
            });

            // Gửi yêu cầu POST
            await axiosInstance.post(url, qs.stringify(data), {
                headers: {
                    'Cookie': '_ga=GA1.1.1318348922.1727412945; _ga_S8WJEW3D2H=GS1.1.1727412944.1.0.1727412946.0.0.0; TrxL4TX2mjqMQ1pKsA7y4inFGqk_=v1Th+GSQSDnT2; ASP.NET_SessionId=kx30vsngytypguotuscihujf; kVisit=f940684f-b4ff-4bd1-8ad9-9432e33033f9'
                }
            })
                .catch(error => {
                    if (error.response) {
                        let cks = error.response.headers["set-cookie"]
                        cookie1 += cks[1].split("=")[1].slice(0, cks[1].split("=")[1].indexOf(";"))
                        cookie2 += cks[2].split("=")[1].slice(0, cks[2].split("=")[1].indexOf(";"))


                    } else if (error.request) {
                        console.error('Error Request:', error.request);
                    } else {
                        console.error('Error Message:', error.message);
                    }
                });


            let token_url = ''

            // Gửi request với cookies
            await axios.get('https://one.haui.edu.vn/loginapi/sv', {
                headers: {
                    'Cookie': `${cookie1}; ${cookie2}`
                }
            })
                .then(response => {
                    let res = response.data
                    token_url = res.slice(res.indexOf("https"), res.indexOf("'</"))
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            return token_url

        } catch (error) {
            console.log("get getTokenUrlHaui false" + error);
            return "get getTokenUrlHaui false" + error
        }


    }




}




module.exports = Services