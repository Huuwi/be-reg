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
    generatorRefreshToken(payLoad, refresh_token_key = process.env.SECRECT_KEY_JWT_REFRESH_TOKEN) {
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
    verifyRefreshToken(access_token, refresh_token_key = process.env.SECRECT_KEY_JWT_REFRESH_TOKEN) {
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
                    if (listIpCountString[i]) {
                        listIpCounts.push(JSON.parse(listIpCountString[i]))
                    }

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

    encodeRSA(data) {

        try {

            try {
                const publicKey = fs.readFileSync('./src/public.pem', 'utf8');
                const bufferData = Buffer.from(data, 'utf8');
                const encryptedData = crypto.publicEncrypt(
                    {
                        key: publicKey,
                        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                        oaepHash: 'sha256',
                    },
                    bufferData
                );
                return encryptedData.toString('base64');
            } catch (err) {
                throw new Error(err)
            }



        } catch (error) {
            console.log("encode RSA false" + error);
            return "encode RSA false" + error
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

    encodeAES(data, key = process.env.KEY_AES, iv = process.env.IV_AES) {
        key = Buffer.from(key.padEnd(32, '0').slice(0, 32)); // Đảm bảo khóa 32 byte
        iv = Buffer.from(iv.padEnd(16, '0').slice(0, 16));
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    decodeAES(encryptedData, key = process.env.KEY_AES, iv = process.env.IV_AES) {
        key = Buffer.from(key.padEnd(32, '0').slice(0, 32)); // Đảm bảo khóa 32 byte
        iv = Buffer.from(iv.padEnd(16, '0').slice(0, 16));
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
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

    async listOrdered(kverify, Cookie) {

        return new Promise(async (reslove, reject) => {
            const url = `https://sv.haui.edu.vn/ajax/register/action.htm?cmd=listorder&v=${kverify}`;
            const payload = qs.stringify({
                fid: "a"
            });

            // Cấu hình request
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'en,vi-VN;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,en-US;q=0.5',
                    'Cookie': Cookie,
                    'Origin': 'https://sv.haui.edu.vn',
                    'Referer': 'https://sv.haui.edu.vn/register/',
                    'Sec-CH-UA': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                    'Sec-CH-UA-Mobile': '?0',
                    'Sec-CH-UA-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };

            await axios.post(url, payload, config)
                .then(response => {
                    reslove(response.data)
                })
                .catch(error => {
                    reject(error)
                });
        })


    }


    async removeClass(kverify, Cookie, classCode) {
        return new Promise(async (reslove, resject) => {
            const url = `https://sv.haui.edu.vn/ajax/register/action.htm?cmd=removeclass&v=${kverify}`;
            const payload = qs.stringify({
                class: classCode,
                ctdk: 863,
            });


            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'en,vi-VN;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,en-US;q=0.5',
                    'Cookie': Cookie,
                    'Origin': 'https://sv.haui.edu.vn',
                    'Referer': 'https://sv.haui.edu.vn/register/',
                    'Sec-CH-UA': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                    'Sec-CH-UA-Mobile': '?0',
                    'Sec-CH-UA-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };

            await axios.post(url, payload, config)
                .then(response => {
                    reslove(response.data)
                })
                .catch(error => {
                    console.error('Lỗi:', error);
                    resject(error)
                });
        })
    }


    async addClass(kverify, Cookie, classCode) {
        return new Promise(async (reslove, resject) => {
            const url = `https://sv.haui.edu.vn/ajax/register/action.htm?cmd=addclass&v=${kverify}`;
            const payload = qs.stringify({
                class: classCode,
                ctdk: 863,
            });


            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'en,vi-VN;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,en-US;q=0.5',
                    'Cookie': Cookie,
                    'Origin': 'https://sv.haui.edu.vn',
                    'Referer': 'https://sv.haui.edu.vn/register/',
                    'Sec-CH-UA': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                    'Sec-CH-UA-Mobile': '?0',
                    'Sec-CH-UA-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };

            await axios.post(url, payload, config)
                .then(response => {
                    reslove(response.data)

                })
                .catch(error => {
                    console.error('Lỗi:', error);
                    resject(error)
                });
        })

    }


    async getInforClass(kverify, Cookie, id) {

        return new Promise(async (reslove, reject) => {
            const url = `https://sv.haui.edu.vn/ajax/register/action.htm?cmd=classbymodulesid&v=${kverify}`;

            const payload = qs.stringify({
                fid: id
            });

            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'en,vi-VN;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,en-US;q=0.5',
                    'Cookie': Cookie,
                    'Origin': 'https://sv.haui.edu.vn',
                    'Referer': 'https://sv.haui.edu.vn/register/',
                    'Sec-CH-UA': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                    'Sec-CH-UA-Mobile': '?0',
                    'Sec-CH-UA-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };


            // Thực hiện request POST
            await axios.post(url, payload, config)
                .then(response => {
                    reslove(response.data)
                })
                .catch(error => {
                    reject(error)
                });
        })
    }



}




module.exports = Services