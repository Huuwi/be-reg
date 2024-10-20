


async function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, ms);
    })

}


const main = async () => {

    console.log(1);
    await sleep(2000)

    console.log(2);

    await sleep(4000);

    console.log(3);



}
main()