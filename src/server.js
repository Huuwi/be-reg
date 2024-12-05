require('dotenv').config({ path: "./src/.env" }); // path from pakage.json (when run command npm start)
const express = require("express");
const { connection } = require("./database/connection.js");
const configServer = require("./config/configServer.js");
const api = require("./api/api.js");
const axios = require("axios")

//global
globalThis.queueScanUserId = []
globalThis.queueRefundUserId = []


//init app
const app = express();


//config server
configServer(app);

//skip cerificate ssl
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'



//connect database
connection.connect()
    .then((res) => {
        console.log(res);
    })
    .catch((e) => {
        console.log(e)
    });






//use router
app.use("/api", api);


//ping server
setInterval(async () => {
    try {
        const response = await axios.get(process.env.FONTEND_URL + "/ping");
        console.log("fontend response:", response.data);

        const response2 = await axios.get(process.env.REFUND_SERVER_URL + "/ping");
        console.log("refund response:", response2.data);

        const response3 = await axios.get(process.env.SCAN_SERVER_URL + "/ping");
        console.log("scan response:", response3.data);
    } catch (error) {
        console.error("Error fetching from backend:", error.message);
    }
}, Math.floor(Math.random() * 500000) + 100000);





//run server
const PORT = Number(process.env.PORT) || 6969;

app.listen(PORT, () => {
    console.log("backend is running on port", PORT);
})