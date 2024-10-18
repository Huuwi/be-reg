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


    // await connection.excuteQuery("create table transactionRegister  (id not null auto_increment primary key , userid int not null , nameHaui varchar(40) , studentCode varchar(20) , passWordHaui varchar(30) , classId int , timeAt varchar(30) ,  ) ")
    //     .then(() => {

    //     })

    // await connection.excuteQuery("ALTER TABLE user add totalCoinGot double default 0 ")
    //     .catch((e) => {
    //         console.log(e);
    //     })
    // await connection.excuteQuery("update user set totalCoinGot = 80 , balance = 80  where username = 'nguyenvanhieu2005'  ")
    //     .catch((e) => {
    //         console.log(e);

    //     })


    // await connection.excuteQuery("alter table classRegisted modify column timeRegisted double ")
    //     .then((res) => {
    //         console.log(res);
    //     })
    //     .catch((e) => {
    //         console.log(e);
    //     }) //done


    // await connection.excuteQuery(
    //     `UPDATE user
    //     WHERE userId = 14;`
    // )
    //     .then((res) => {
    //         console.log(res);
    //     })
    //     .catch((e) => {
    //         console.log(e);
    //     }) // done



    // await connection.excuteQuery("create table transactionPayment (id varchar(50)  primary key ,  amount int , time varchar(40) ,addCoin boolean , userName varchar(20)  ) ").catch((e) => {
    //     console.log(e);
    // })


    // await connection.excuteQuery(`ALTER TABLE classRegisted
    // modify COLUMN nameHaui varchar(50) CHARACTER SET utf8mb4 default 'chưa xác định' ;`).catch((e) => {
    //     console.log(e);
    // })

    // await connection.excuteQuery("create table userHaui ( studentCode varchar(20) primary key , passWord varchar(30) , fullname VARCHAR(40) CHARACTER SET utf8mb4   )")


    // await connection.excuteQuery("create table classRegisted (id int not null auto_increment primary key , moduleName VARCHAR(150) CHARACTER SET utf8mb4 , classCode varchar(30), classId varchar(20) , className varchar(20) , teacherName varchar(50) CHARACTER SET utf8mb4 , timeRegisted int , userId int , studentCode varchar(30)  )")
    //     .then((res) => {
    //         console.log(res);
    //     })
    //     .catch((e) => {
    //         console.log(e);
    //     })


    await connection.excuteQuery("select * from classRegisted")
        .then((res) => {
            console.log(res);
        })
        .catch((e) => {
            console.log(e);
        })

    //     await connection.excuteQuery(`SELECT table_name FROM information_schema.tables
    // WHERE table_schema = 'defaultdb'`)
    //         .then((res) => {
    //             console.log(res);
    //         })
    //         .catch((e) => {
    //             console.log(e);
    //         })


    await connection.disconnect()
        .then((res) => {
            console.log(res);
        })
        .catch((e) => {
            console.log(e);
        })

}
main()