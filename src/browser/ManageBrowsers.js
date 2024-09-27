const puppeteer = require("puppeteer")

class ManageBrowsers {
    max_quantity_browsers = 15;
    curent_quantity_browser = 0;

    constructor() {
        console.log("init successfully new ManagerBrowsers");

    }

    async getInforFromTokenUrlHaui(url) {
        this.curent_quantity_browser++


        try {


            if (this.curent_quantity_browser >= this.max_quantity_browsers) {
                console.log("max browser cant service");
                return
            }
            let browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage', // Sử dụng tmpfs thay vì disk-based shared memory.
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu', // Tắt GPU rendering.
                    '--single-process', // Tất cả thao tác trong một quy trình để giảm RAM.
                    '--window-size=1280,800', // Giảm kích thước cửa sổ.
                    '--disable-features=site-per-process', // Tắt các tính năng site isolation.
                ]
            })


            const page = await browser.newPage();

            await page.setCacheEnabled(false);

            // Chặn tải hình ảnh và CSS để tiết kiệm tài nguyên
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                const resourceType = request.resourceType();
                if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
                    request.abort(); // Chặn tải hình ảnh, CSS, font.
                } else {
                    request.continue();
                }
            });
            await page.goto(url)


            let cookies = await page.cookies();
            let Cookie = ""
            cookies = cookies.map((e) => { return e.name + "=" + e.value + "; " })
            for (let i = 0; i < cookies.length; i++) {
                Cookie += cookies[i]
            }
            let name = ""

            try {
                name = await page.$eval(
                    'body > div.be-wrapper.be-fixed-sidebar > nav > div > div.be-right-navbar > ul > li > a > span',
                    el => el.textContent
                );
            } catch (error) {
                throw new Error(error)
            }

            const kverify = await page.evaluate(() => {
                return window.kverify;
            });
            await browser.close()
            this.curent_quantity_browser--;

            return {
                name, Cookie, kverify
            }


        } catch (error) {
            this.curent_quantity_browser--
            console.log("error when initNewBrowser", error);

        }


    }


}
module.exports = ManageBrowsers