const api = require("express").Router()
const Controler = require("../controler/controler.js")
const MiddleWare = require("../middleware/middleware.js")

//create a instance
let controler = new Controler()
let middleware = new MiddleWare()

//test api
api.get("/ping", (req, res) => {
    res.cookie("ping", "ok", {
        httpOnly: true
    });

    res.status(200).json({
        message: "ok from backend!"
    });
})



//use middleware

//check ip black list
// api.use("*", middleware.checkIpAdress)



// middle ware for /auth api
api.use("/auth", middleware.checkInforAccessToken)




//api login
api.post("/login", controler.loginAccount)


//api register
api.post("/register", controler.registerAccount)

//get new access token
api.post("/getNewAccessToken", controler.getNewAccessToken)


//auth_api
api.get("/auth/getInforUser", controler.getInforUser) // font end make request for data user
api.post("/auth/loginHaui", controler.loginHaui) // login haui sv
api.post("/auth/getListordered", controler.getListordered) // list ordered
api.post("/auth/removeClass", controler.removeClass)
api.post("/auth/registerClass", controler.registerClass) // chưa hoàn thiện logic để trừ tiền tài khoản
api.post("/auth/getInforClass", controler.getInforClass)
api.post("/auth/pingHaui", controler.pingHaui)
api.post("/auth/logoutAccount", controler.logoutAccount)
api.post("/auth/getHistoryPayment", controler.getHistoryPayment)
api.post("/auth/getHistoryRegisted", controler.getHistoryRegisted)



//transaction api

api.post("/auth/createPaymentLink", controler.createPaymentLink)
api.post("/auth/checkPayMent", controler.checkPayment)


module.exports = api