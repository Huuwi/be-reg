require('dotenv').config({ path: '../.env' })
const { connection } = require("./connection.js")

const main = async () => {

    await connection.connect()
        .then((res) => {
            console.log(res);
        })
        .catch((e) => {
            console.log(e)
        })



    // await connection.excuteQuery("create table user (userId int NOT NULL AUTO_INCREMENT PRIMARY KEY, userName varchar(20) NOT NULL unique, passWord varchar(100) NOT NULL, referralCode varchar(70) NOT NULL, balance double default 0 , timeCreate varchar(30) default 'none' )")
    //     .then((res) => {
    //         console.log(res);
    //     })
    //     .catch((e) => {
    //         console.log(e);
    //     })    //done

    // await connection.excuteQuery("alter table user modify column passWord varchar(100) default 'none' ")
    //     .then((res) => {
    //         console.log(res);
    //     })
    //     .catch((e) => {
    //         console.log(e);
    //     }) //done


    await connection.excuteQuery(
        `UPDATE user
        SET balance = 10
        WHERE userId = 14;`
    )
        .then((res) => {
            console.log(res);
        })
        .catch((e) => {
            console.log(e);
        }) // done


    // for (let i = 10; i <= 12; i++) {
    //     await connection.excuteQuery(`delete from user where userId = ${i}`)
    //         .then((res) => {
    //             console.log(res);
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //         })
    // }




    await connection.excuteQuery("select * from user")
        .then((res) => {
            console.log(res);
        })
        .catch((e) => {
            console.log(e);
        })


    await connection.disconnect()
        .then((res) => {
            console.log(res);
        })
        .catch((e) => {
            console.log(e);
        })

}
main()