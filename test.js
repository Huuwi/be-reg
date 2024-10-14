const fs = require("fs");

let patternNameModule = /(?<module_name>^.+?)\s--\s(?<module_id>\d+)\s+module_code\s:\s(?<module_code>.+)/

let oldData = fs.readFileSync("./module.txt", 'utf-8').split("\r\n");

let res = []

for (let i = 0; i < oldData.length; i++) {
    let result = oldData[i].match(patternNameModule);
    // console.log(result);

    if (result) {
        res.push(result.groups)
    }
}

fs.appendFileSync("./jsonModule.txt", JSON.stringify(res))




