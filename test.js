const fs = require("fs")



let d = Date.now()
let n = Number(d.toString().slice(2) + Math.floor(Math.random() * Math.pow(10, Math.floor(Math.random() * 4))).toString());
console.log(n);


