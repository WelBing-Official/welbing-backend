require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const {
    add_user_to_waitlist,
    register_user,
    search_patient,
    post_medical_report,
    add_tag,
    login
} = require("./functions.js")

const port = process.env.PORT || 4000;
const allowedOrigin = process.env.ALLOWED_ORIGIN;

app.use(cors({
    origin: allowedOrigin
  }));

app.get("/",(req, res) => {
    res.status(200).json({
        resolved : true,
        message : "hello world"
    })
});

app.post("/wait-list",(req,res) => {
    let body = "";
    req.on("data", data => body += data);
    req.on("end", () => {
        try {
            const params = JSON.parse(body);
            const arr = [params.name , params.email , params.category];
            if(arr.some(e => !e)) {
                res.status(200).json({
                    resolved : false,
                    message : "Input error"
                })
            }
            else {
                add_user_to_waitlist(params.name , params.email , params.category , resolvement => {
                    res.status(200).json(resolvement);
                });
            }
        }
        catch(err) {
            res.status(200).json({
                resolved : false,
                message : "Error while parsing data, " + err
            })
        }
    });
});

app.post("/register",(req,res) => {
    let body = "";
    req.on("data", data => body += data);
    req.on("end", () => {
        try {
            const params = JSON.parse(body);
            const arr = [params.name , params.email , params.password , params.category];
            const category = ["basic", "practitioner" , "hospital"]
            if(arr.some(e => !e) || category.indexOf(params.category) === -1 ) {
                res.status(200).json({
                    resolved : false,
                    message : "Input error"
                })
            }
            else {
                register_user(params.name , params.email , params.password , params.category, resolvement => {
                    res.status(200).json(resolvement)
                })
            }
        }
        catch(err) {
            res.status(200).json({
                resolved : false,
                message : "Error while parsing data, " + err
            })
        }
    })
})

app.get("/search",(req, res) => {
    let body = "";
    req.on("data", data => body += data);
    req.on("end", () => {
        try {
            const params = JSON.parse(body);
            const arr = [params.name];
            if(arr.some(e => !e)) {
                res.status(200).json({
                    resolved : false,
                    message : "Input error"
                })
            }
            else {
                search_patient(params.name , resolvement => {
                    res.status(200).json(resolvement)
                })
            }
        }
        catch(err) {
            res.status(200).json({
                resolved : false,
                message : "Error while parsing data, " + err
            })
        }
    })
});

app.post("/post-report", (req, res) => {
    let body = "";
    req.on("data", data => body += data);
    req.on("end", () => {
        try {
            const params = JSON.parse(body);
            const arr = [params.patient_tracking_id, params.doctor_name, params.medical_report , params.hospital_tracking_id];
            if(arr.some(e => !e)) {
                res.status(200).json({
                    resolved : false,
                    message : "Input error"
                })
            }
            else {
                post_medical_report(params.patient_tracking_id, params.doctor_name, params.medical_report, params.optional_tag , params.hospital_tracking_id, resolvement => {
                    res.status(200).json(resolvement)
                })
            }
        }
        catch(err) {
            res.status(200).json({
                resolved : false,
                message : "Error while parsing data, " + err
            })
        }
    })
})

app.post("/post-tag", (req, res) => {
    let body = "";
    req.on("data", data => body += data);
    req.on("end", () => {
        try {
            const params = JSON.parse(body);
            const arr = [params.patient_tracking_id, params.doctor_name, params.reason, params.tag_name , params.hospital_tracking_id];
            if(arr.some(e => !e)) {
                res.status(200).json({
                    resolved : false,
                    message : "Input error"
                })
            }
            else {
                add_tag(params.patient_tracking_id, params.doctor_name, params.reason, params.tag_name , params.hospital_tracking_id, resolvement => {
                    res.status(200).json(resolvement)
                })
            }
        }
        catch(err) {
            res.status(200).json({
                resolved : false,
                message : "Error while parsing data, " + err
            })
        }
    })
})

app.post("/login", (req,res) => {
    let body = "";
    req.on("data", data => body += data);
    req.on("end", () => {
        try {
            const params = JSON.parse(body);
            const arr = [params.email , params.password , params.category];
            const category = ["basic", "practitioner" , "hospital"]
            if(arr.some(e => !e) || category.indexOf(params.category) === -1 ) {
                res.status(200).json({
                    resolved : false,
                    message : "Input error"
                })
            }
            else {
                login(params.email , params.password , params.category, resolvement => {
                    res.status(200).json(resolvement)
                })
            }
        }
        catch(err) {
            res.status(200).json({
                resolved : false,
                message : "Error while parsing data, " + err
            })
        }
    })
});

app.listen(port, () => {
    console.log("Server is running...");
});