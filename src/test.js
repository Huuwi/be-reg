const axios = require('axios');

async function fetchTransactions() {
    const url = 'https://oauth.casso.vn/v2/transactions';
    const params = {
        fromDate: '2021-04-01',
        page: 4,
        pageSize: 20,
        sort: 'ASC'
    };

    const headers = {
        'Authorization': 'AK_CS.857726507d8711efa2f1b114d48992ca.5MkSmjIMFDlSq9YXQ16BnPnLvpJYBKUZg68uaLpgYaQ1jNC75OySfBquKlzIPc0FgyC8Xqy9' // Hoặc 'Bearer <access token>'
    };

    try {
        const response = await axios.get(url, { params, headers });
        console.log('Dữ liệu nhận được:', response.data);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error.response ? error.response.data : error.message);
    }
}

fetchTransactions();
