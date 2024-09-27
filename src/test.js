const fs = require('fs');
const crypto = require('crypto');

const privateKey = fs.readFileSync('private.pem', 'utf8');
const encryptedData = "";

try {
    // Giải mã dữ liệu sử dụng private key
    const decryptedData = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
        },
        Buffer.from(encryptedData, 'base64') // Convert dữ liệu mã hóa về Buffer
    );

    // Trả về dữ liệu đã giải mã
    console.log({ decryptedData: decryptedData.toString() });
} catch (err) {
    console.log({ error: 'Giải mã thất bại' });
}