require('dotenv').config({ path: "./src/.env" }); // path from pakage.json (when run command npm start)
const express = require("express");
const { connection } = require("./database/connection.js");
const configServer = require("./config/configServer.js");
const api = require("./api/api.js");
const axios = require("axios")
//init app
const app = express();


//config server



configServer(app);





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



setInterval(async () => {
    try {
        const response = await axios.get(process.env.FONTEND_URL + "/ping");
        console.log("fontend response:", response.data);
    } catch (error) {
        console.error("Error fetching from backend:", error.message);
    }
}, Math.floor(Math.random() * 500000) + 300000);




//run server
const PORT = Number(process.env.PORT) || 6969;

app.listen(PORT, () => {
    console.log("backend is running on port", PORT);
})