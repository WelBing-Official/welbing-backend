const mysql = require("mysql");
const nodemailer = require("nodemailer");

let con = mysql.createConnection({
    host : process.env.NYSQL_HOST,
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
});

function end_con() {
    con.end();
    con = mysql.createConnection({
        host : process.env.MYSQL_HOST,
        user : process.env.MYSQL_USER,
        password : process.env.MYSQL_PASSWORD,
        database : process.env.MYSQL_DATABASE
    });
}

module.exports.add_user = function(name , email , category , callback) {
    const sql = `SELECT email_address FROM users WHERE email_address = ?`;
    const value = [email];
    con.query(sql , value , (err , result) => {
        if(err) {
            console.log(err)
            callback({
                resolved : false,
                message : `Server error`
            });
        }
        else if(result.length > 0) {
            end_con();
            callback({
                resolved : false,
                message : "Already joined before"
            });
        }
        else {
            const sql = `INSERT INTO users (name, email_address, category) VALUES (?,?,?)`;
            const values = [name,email, category];
            con.query(sql , values , (err, result) => {
                if(err) {
                    console.log(err)
                    callback({
                        resolved : false,
                        message : `Server error`
                    });
                }
                else {
                    //send mail before callback
                    callback({
                        resolved : true,
                        message : "Has joined successfully"
                    });
                }
            })
        }
    })
};