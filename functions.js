const mysql = require("mysql");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

let con = mysql.createConnection({
    host : process.env.MYSQL_HOST,
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

function mail(email, subject, html , callback) {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET , "https://developers.google.com/oauthplayground");
    
    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    });
    const accessToken = oauth2Client.getAccessToken();
    const smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
             type: "OAuth2",
             user: "welbingofficial@gmail.com", 
             clientId: process.env.CLIENT_ID,
             clientSecret: process.env.CLIENT_SECRET,
             refreshToken: process.env.REFRESH_TOKEN,
             accessToken: accessToken
        }
   });
   const mailOptions = {
    from: "Welbing <welbingofficial@gmail.com>",
    to: email,
    subject: subject,
    generateTextFromHTML: true,
    html: html
    };
    smtpTransport.sendMail(mailOptions, (error, response) => {
        error ? console.log(error) : null;
        smtpTransport.close();
        callback();
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
                    //work on categorizing the emails based on the category selected by the user
                    mail(email , "Thanks for joining our waitlist", "<b>Thanks for joining our waitlist</b>", () => {
                        callback({
                            resolved : true,
                            message : "Has joined successfully"
                        });
                    })
                }
            })
        }
    })
};