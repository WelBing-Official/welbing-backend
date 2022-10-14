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
                    mail(email , "Thanks for joining our waitlist", `
                    <div style="width: 100%;">
                        <div style="color: #383838; max-width: 400px; margin: auto; ">
                            <div style="border-bottom: 0.6px solid #ffffff;height: 10vh;min-height: max-content;width: 100%;padding: 5px 10px;">
                                <br/>
                                <a href="https://welbing.netlify.app/" style="height: 50px;margin: auto; display: block;">
                                    <img src="https://welbing.netlify.app/assets/Logo.076a8893.png" alt="Welbing" style="display: block; height: 32px; margin: auto;"/>
                                </a>
                            </div>
                            <div style="margin: 0 0 0px;padding: 50px 40px; background-color:#2d286308;">
                                <h1 style="margin-top: 30px;">Hello there ${name}!!</h1>
                                <p style="margin-top: 20px;">
                                    We're so glad that you took your time to join our waitlist, with welbing we are trying to make the hospitals sector a better place for both me and you!
                                    From the public hospitals to the private hospitals and medical practitioners too!!</p>
                                <p style="margin-top: 20px;">
                                    We hope you stick around and see what greatness we're building here.
                                    We will send you newsletters showing how far we've gotten and pointing out how and where we can help your category of people using our solution, so you just hang in there and wait while we do our part.
                                </p>
                                <p style="margin-top: 20px;">Have a nice day!!</p>
                                <p style="margin-top: 20px;">
                                    <b>Regards</b>,
                                    <br/>
                                    Team WelBing.
                                </p>
                            </div>
                        </div>
                    </div>`, () => {
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