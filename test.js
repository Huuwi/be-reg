const fs = require('fs');
const path = require('path');

// Đường dẫn mới cho file log
const logFilePath = path.join('/tmp', 'countIdtrans.txt');  // hoặc có thể là './src/logs/countIdtrans.txt'

function createPaymentLink() {
    try {
        fs.writeFileSync(logFilePath, 'Your data here');
        console.log('Log file written successfully');
    } catch (err) {
        console.error('Error writing log file:', err);
    }
}

// Tương tự thay đổi cho các file khác như errServer.txt, blackListIps.txt, ...
console.log(logFilePath);
