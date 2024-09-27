require('dotenv').config({ path: '../.env' })
const mysql2 = require("mysql2");

class Connection {
    constructor(DATABASE_HOST, DATABASE_USER_NAME, DATABASE_PASS_WORD, DATABASE_NAME, DATABASE_PORT) {
        this.DATABASE_HOST = DATABASE_HOST;
        this.DATABASE_USER_NAME = DATABASE_USER_NAME;
        this.DATABASE_PASS_WORD = DATABASE_PASS_WORD;
        this.DATABASE_NAME = DATABASE_NAME;
        this.DATABASE_PORT = DATABASE_PORT;
        this.connection = null;
    }

    async connect() {
        if (this.connection) {
            return "Already connected to database";
        }
        return new Promise(async (resolve, reject) => {
            try {
                this.connection = mysql2.createConnection({
                    host: this.DATABASE_HOST,
                    user: this.DATABASE_USER_NAME,
                    password: this.DATABASE_PASS_WORD,
                    database: this.DATABASE_NAME,
                    port: this.DATABASE_PORT,
                });

                // console.log("Connected successfully to the database: " + this.DATABASE_NAME);
                resolve("Connected successfully to the database: " + this.DATABASE_NAME);
            } catch (err) {
                reject("Error when connecting to database " + this.DATABASE_NAME + " err: " + err.message);
            }
        });
    }


    async disconnect() {
        if (this.connection) {
            return new Promise((resolve, reject) => {
                this.connection.end((err) => {
                    if (err) {
                        reject("Error when disconnecting from database: " + err.message);
                    } else {
                        console.log("Disconnected successfully from database: " + this.DATABASE_NAME);
                        resolve("Disconnected");
                    }
                });
            });
        } else {
            console.log("No active connection to disconnect.");
            return "No active connection to disconnect."
        }
    }

    async excuteQuery(sql_statement) {
        if (!this.connection) {
            await this.connect().catch((e) => {
                console.log("err when connect to db");
                return
            });
        }
        return new Promise((resolve, reject) => {
            this.connection.query(sql_statement, (err, results) => {
                if (err) {
                    return reject(`Error when executing query: ${sql_statement}, error: ${err.message}`);
                }
                console.log("Executed successfully query: " + sql_statement);
                resolve(results);
            });
        });
    }
}

// Khởi tạo kết nối và xuất module để sử dụng trong các file khác
const connection = new Connection(
    process.env.DATABASE_HOST, process.env.DATABASE_USER_NAME, process.env.DATABASE_PASS_WORD, process.env.DATABASE_NAME, process.env.DATABASE_PORT
);

console.log(connection);

module.exports = {
    Connection,
    connection,
};
