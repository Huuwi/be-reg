require('dotenv').config({ path: "./src/.env" }); // path from pakage.json (when run command npm start)
const express = require("express");
const { connection } = require("./database/connection.js");
const configServer = require("./config/configServer.js");
const api = require("./api/api.js");

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





//run server
const PORT = Number(process.env.PORT) || 6969;

app.listen(PORT, () => {
    console.log("backend is running on port", PORT);
})