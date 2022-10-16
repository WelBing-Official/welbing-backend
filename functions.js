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

function random_string(len) {
    const string = "qwe1r5t2yu3iop4as6dfgh78jklz0xcvb9nm";
    let new_string = "";
    for(let i = 0; i <= len; i++) {
        new_string += string[Math.floor(Math.random() * string.length)];
    }
    return new_string;
}

function random_number(len) {
    let num = "";
    for(let i= 0; i < len; i++) {
        num += Math.floor(Math.random() * 10);
    }
    return Number(num)
}

module.exports.add_user_to_waitlist = function(name , email , category , callback) {
    const sql = `SELECT email_address FROM users WHERE email_address = ?`;
    const value = [email];
    con.query(sql , value , (err , result) => {
        end_con();
        if(err) {
            console.log(err)
            callback({
                resolved : false,
                message : `Server error`
            });
        }
        else if(result.length > 0) {
            callback({
                resolved : false,
                message : "Already joined before"
            });
        }
        else {
            const sql = `INSERT INTO users (name, email_address, category) VALUES (?,?,?)`;
            const values = [name,email, category];
            con.query(sql , values , (err, result) => {
                end_con();
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

module.exports.register_user = function(name, email, password , category , callback) {
    const sql = `SELECT tracking_id FROM ${category} WHERE email_address = ? AND password = ? LIMIT 1`;
    const values = [email, password];
    con.query(sql , values , (err, result) => {
        end_con();
        if(err) {
            console.log(err);
            callback({
                resolved : false,
                message : `Server error`
            });
        }
        else if(result.length > 0) {
            callback({
                resolved : true,
                message : "exists",
                addon : {
                    tracking_id : result[0].tracking_id
                }
            })
        }
        else {
            let sql = "";
            let values = [];
            const tracking_id = random_string(20);
            switch (category) {
                case "practitioner":
                    sql = "INSERT INTO practitioner (name , email_address , password , tracking_id , email_verificaton_code , email_verified , profile_data) VALUES (?,?,?,?,?,?,?)";
                    values = [name, email, password, tracking_id ,random_number(5) , 0, JSON.stringify({
                        gender : "",
                        date_of_birth : "",
                        contact_info : "",
                        area_of_specialization : "",
                        place_of_work : "",
                        rating : 0
                    })];
                    break;
                case "hospital":
                    sql = "INSERT INTO hospital (name , email_address , password , tracking_id , email_verificaton_code , email_verified , profile_data) VALUES (?,?,?,?,?,?,?)";
                    values = [name, email, password, tracking_id ,random_number(5) , 0, JSON.stringify({
                        location : "",
                        rating : 0
                    })];
                    break;
                default:
                    sql = "INSERT INTO basic (name , email_address , password , tracking_id , email_verificaton_code , email_verified , health_profile , medical_report , tags) VALUES (? , ? , ? , ? , ? , ?, ?, ?, ?)";
                    values = [name , email, password , tracking_id ,random_number(5) , 0, JSON.stringify({
                        gender : "",
                        date_of_birth : "",
                        address : "",
                        occupation : "",
                        contact_information : "",
                        emergency_contact_information : "",
                        Nationality : "",
                        state_of_origin : "",
                        genotype : "",
                        blood_type : "",
                        genetic_disease : "",
                        Allergies : "",
                        physical_challenge : "",
                        weight : {
                            value : "",
                            time : ""
                        }
                    }) , JSON.stringify([]), JSON.stringify([])];
                    break;
            }
            con.query(sql , values , (err, result) => {
                end_con();
                if(err) {
                    console.log(err);
                    callback({
                        resolved : false,
                        message : `Server error`
                    });
                }
                else {
                    //the message sent to the frontend should be the tracking id
                    callback({
                        resolved : true,
                        message : "Registration successfull. Check email for verification code",
                        addon : {
                            tracking_id : tracking_id
                        }
                    });
                }
            })
        }
    })
}

module.exports.search_patient = function(name, callback) {
    const sql = 'SELECT name ,  tracking_id , health_profile , medical_report , tags FROM basic WHERE name LIKE ?';
    const values = [`%${name.trim()}%`];
    con.query(sql, values, (err, result) => {
        end_con();
        if(err) {
            console.log(err);
            callback({
                resolved : false,
                message : `Server error`
            });
        }
        else {
            const response_obj = [];
            if(result.length > 0) {
                result.forEach(e => {
                    response_obj.push({
                        name : e.name,
                        tracking_id : e.tracking_id,
                        profile : JSON.parse(e.health_profile),
                        medical_report : JSON.parse(e.medical_report),
                        tags : JSON.parse(e.tags)
                    })
                })
            }
            callback({
                resolved : true,
                message : response_obj
            })
        }
    })
}

module.exports.post_medical_report = function(patient_tracking_id, doctor_name, medical_report , option_tag , hospital_tracking_id, callback) {
    const sql = "SELECT * FROM hospital WHERE tracking_id = ? LIMIT 1";
    const value = [hospital_tracking_id];
    con.query(sql, value, (err, result) => {
        end_con();
        if(err) {
            console.log(err);
            callback({
                resolved : false,
                message : `Server error`
            });
        }
        if(result.length > 0) {
            const hospital_info = `${result[0].name} , ${JSON.parse(result[0].profile_data).location}`;
            const sql = "SELECT medical_report FROM basic WHERE tracking_id = ?";
            const value = [patient_tracking_id];
            con.query(sql, value, (err, result) => {
                end_con();
                if(err) {
                    console.log(err);
                    callback({
                        resolved : false,
                        message : `Server error`
                    });
                }
                if(result.length > 0) {
                    const medical_reports = JSON.parse(result[0].medical_report);
                    medical_reports.push({
                        doctor_name : doctor_name,
                        medical_report : medical_report,
                        option_tag : option_tag,
                        hospital_info : hospital_info,
                        time : new Date().toString()
                    });
                    const sql = "UPDATE basic SET medical_report = ? WHERE tracking_id = ?";
                    const values = [JSON.stringify(medical_reports) , patient_tracking_id];
                    con.query(sql , values , (err, result , fields) => {
                        end_con();
                        if(err) {
                            console.log(err);
                            callback({
                                resolved : false,
                                message : `Server error`
                            });
                        }
                        else {
                            callback({
                                resolved : true,
                                message : `Report posted`
                            });
                        }
                    })
                }
                else {
                    callback({
                        resolved : false,
                        message : `Wrong patient tracking id`
                    });
                }
            })
        }
        else {
            callback({
                resolved : false,
                message : `Wrong hospital's tracking id`
            });
        }
    })
}


module.exports.add_tag = function(patient_tracking_id, doctor_name, reason , tag_name , hospital_tracking_id, callback) {
    const sql = "SELECT * FROM hospital WHERE tracking_id = ? LIMIT 1";
    const value = [hospital_tracking_id];
    con.query(sql, value, (err, result) => {
        end_con();
        if(err) {
            console.log(err);
            callback({
                resolved : false,
                message : `Server error`
            });
        }
        if(result.length > 0) {
            const hospital_info = `${result[0].name} , ${JSON.parse(result[0].profile_data).location}`;
            const sql = "SELECT tags FROM basic WHERE tracking_id = ?";
            const value = [patient_tracking_id];
            con.query(sql, value, (err, result) => {
                end_con();
                if(err) {
                    console.log(err);
                    callback({
                        resolved : false,
                        message : `Server error`
                    });
                }
                if(result.length > 0) {
                    const tags = JSON.parse(result[0].tags);
                    tags.push({
                        doctor_name : doctor_name,
                        reason : reason,
                        tag_name : tag_name,
                        hospital_info : hospital_info,
                        time : new Date().toString()
                    });
                    const sql = "UPDATE basic SET tags = ? WHERE tracking_id = ?";
                    const values = [JSON.stringify(tags) , patient_tracking_id];
                    con.query(sql , values , (err, result , fields) => {
                        end_con();
                        if(err) {
                            console.log(err);
                            callback({
                                resolved : false,
                                message : `Server error`
                            });
                        }
                        else {
                            callback({
                                resolved : true,
                                message : `Tag added to patient's profile`
                            });
                        }
                    })
                }
                else {
                    callback({
                        resolved : false,
                        message : `Wrong patient tracking id`
                    });
                }
            })
        }
        else {
            callback({
                resolved : false,
                message : `Wrong hospital's tracking id`
            });
        }
    })
}

module.exports.login = function(email, password , category , callback) {
    const sql = `SELECT tracking_id FROM ${category} WHERE email_address = ? AND password = ? LIMIT 1`;
    const values = [email, password];
    con.query(sql , values , (err, result) => {
        end_con();
        if(err) {
            console.log(err);
            callback({
                resolved : false,
                message : `Server error`
            });
        }
        else if(result.length > 0) {
            callback({
                resolved : true,
                message : "Loging in",
                addon : {
                    tracking_id : result[0].tracking_id
                }
            })
        }
        else {
            callback({
                resolved : false,
                message : "Incorrect email or password"
            })
        }
    });
}

module.exports.update_profile = function(data, callback) {
    const sql = "SELECT name , health_profile FROM basic WHERE tracking_id = ? LIMIT 1";
    const value = [data.tracking_id];
    con.query(sql , value , (err , result) => {
        end_con();
        if(err) {
            console.log(err)
            callback({
                resolved : false,
                message : "Server error"
            });
        }
        else if(result.length > 0) {
            let name = result[0].name;
            if(name !== data.name.trim()) {
                name = data.name.trim()
            }
            let profile_data = JSON.parse(result[0].health_profile);
            for(let i in data.profile) {
                if(data.profile[i] && data.profile[i] !== profile_data[i]) {
                    if(i == "weight") {
                        profile_data.weight.value = data.profile[i];
                        profile_data.weight.time = new Date().toString();
                    }
                    else {
                        profile_data[i] = data.profile[i];
                    }
                }
            }
            const sql = "UPDATE basic SET name = ? , health_profile = ? WHERE tracking_id = ?";
            const values = [name , profile_data];
            con.query(sql , values , (err , result , fields) => {
                if(err) {
                    console.log(err)
                    callback({
                        resolved : false,
                        message : "Server error"
                    });
                }
                else {
                    callback({
                        resolved : true,
                        message : "Profile updated"
                    });
                }
            })
        }
        else {
            callback({
                resolved : false,
                message : "Wrong tracking id"
            })
        }
    })
}