const puppeteer = require("puppeteer")

class OneBrowser {
    max_quantity_contexts = 10;
    curent_quantity_contexts = 0;
    browser = null;
    constructor() {
        console.log("init successfully new OneBrowser");
    }

    async initBrowser() {
        try {
            if (this.browser != null) {
                console.log("already create a browser!!!");
            }
            this.browser = await puppeteer.launch({
                executablePath:
                    process.env.NODE_ENV === "production"
                        ? process.env.PUPPETEER.EXECUTABLE_PATH
                        : puppeteer.executablePath(),
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage', // Sử dụng tmpfs thay vì disk-based shared memory.
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu', // Tắt GPU rendering.
                    '--window-size=1280,800', // Giảm kích thước cửa sổ.
                    '--disable-features=site-per-process', // Tắt các tính năng site isolation.
                ]
            })


        } catch (error) {
            this.browser = null
            console.log("error when initBrowser", error);
        }
    }


    async getInforFromTokenUrlHaui(url) {

        // console.log({
        //     curent: this.curent_quantity_contexts,
        //     browserNull_: !this.browser
        // });


        try {

            if (this.curent_quantity_contexts >= this.max_quantity_contexts) {
                console.log("max quantity contexts can services");
                return;
            }

            if (!this.browser) {
                await this.initBrowser();
            }

            this.curent_quantity_contexts++;


            let context = await this.browser.createBrowserContext();
            if (!context) {
                console.log("browser : ", this.browser);
                console.log("context : ", this.context);

                await this.initBrowser();
                context = await this.browser.createBrowserContext();
            }
            const page = await context.newPage();
            await page.goto(url);


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

            await context.close()
            this.curent_quantity_contexts--;

            if (this.curent_quantity_contexts == 0) {
                await this.closeBrowser()
            }


            return {
                name, Cookie, kverify
            }




        } catch (error) {
            this.curent_quantity_contexts--;
            this.browser = null;
            console.log("error when initNewBrowser", error);

        }


    }



    async closeBrowser() {
        try {
            await this?.browser?.close();
            this.browser = null
            this.curent_quantity_contexts = 0;
            this.isRunning = false;
        } catch (error) {
            this.browser = null
            console.log("error when closeBrowser", error);

        }
    }



}

module.exports = OneBrowser