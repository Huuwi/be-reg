const axios = require("axios")

axios.post("https://banca90.com/api/0.0/Home/GetCaptchaForLogin")
    .then((data) => {
        console.log(data);

    })