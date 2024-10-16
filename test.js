const axios = require("axios");
const qs = require("qs");

class Thread {
    constructor(kverify, Cookie, id) {
        this.kverify = kverify;
        this.Cookie = Cookie;
        this.id = id;
    }

    async scan() {
        const url = `https://sv.haui.edu.vn/ajax/register/action.htm?cmd=classbymodulesid&v=${this.kverify}`;
        const payload = qs.stringify({ fid: this.id });

        const config = {
            headers: {
                'Cookie': this.Cookie,
                'Origin': 'https://sv.haui.edu.vn',
                'Referer': 'https://sv.haui.edu.vn/register/',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            const response = await axios.post(url, payload, config);
            console.log(`ID ${this.id}:`, response.data);
        } catch (error) {
            console.error(`Lỗi với ID ${this.id}:`, error.response ? error.response.data : error.message);
        }
    }
}

const main = async () => {
    const kverify = "49628915710D2AC7E37C431FA8E09D3F";
    const cookie = `onehauisv=AFEDE428602B7027C1BB52F4D584136537DAC10611907333496E561FC3D16600B3EC05B63DF2CBB91FEB8E979AF2B7E72B1861963FA9BDF2393747D2D55E7D911FB7AF31DD1373F27DA5FE4EC6DFAECD3A398EC6A21B7721699EAE70536854F6A98562C63303BCBB5F564C3D2B3D77195C733FE5CA1B8629C727074589BAEE5A1CACC679E45A8EC580E3769E76C0C915A21503381F6D541E56C578FF1F84E0831D8A35D4A45D16184EC2FD8D00CDBB92F076ED5974C468459B24E5502E2B5BA37A3959E78FE2693FDDC52B1A0773EC142EE90641D7BA918B0C2D8D7BC285A0395BF3C9230AE437546B629A66E96965FCD62624120CF5F91F23010A7C091A79966F4BBB6320E64A5CCC90D6B8B7A9CDACC083E34ACB8DF8B08030AEECA6BBF4B32FC1B03D57D44CE3EFDB9E7F9DCC7D0664ADD8603D1975B41E348C9BCD2929B9004D55C508848B2888E783903E173A78B21E56ADA1C2B97458F04D95C878A6F7D3494B81167643CC2253200BAD805864; __Host-UqZBpD3n=v1UB+GSQ__GeP; kVisit=dfd61503-8b71-4cb9-9fbf-3f24727a098c; ASP.NET_SessionId=xekjj0jr3yg4qyuylwqk2vsx;`;

    // Tạo danh sách các thread
    console.time("bat dau");

    const processes = [];
    for (let i = 3000; i < 3080; i++) { // Giới hạn để tránh quá nhiều requests
        const thread = new Thread(kverify, cookie, i);
        processes.push(thread.scan());
    }

    // Chạy tất cả các thread song song
    try {
        await Promise.all(processes);
        console.log("Quét xong tất cả các lớp.");
    } catch (error) {
        console.error("Có lỗi xảy ra:", error);
    }
    console.timeEnd("bat dau")
};

main();
