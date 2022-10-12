require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const {add_user} = require("./functions.js")

const port = process.env.PORT || 4000;
const allowedOrigin = process.env.ALLOWED_ORIGIN;

app.use(cors({
    origin: function(origin, callback){
      if(!origin) return callback(null, true);
      if(allowedOrigin !== origin){
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(msg, false);
      }
      return callback(null, true);
    }
  }));

app.get("/",(req, res) => {
    res.status(200).json({
        resolved : true,
        message : "hello world"
    })
});

app.post("/",(req,res) => {
    let body = "";
    req.on("data", data => body += data);
    req.on("end", () => {
        try {
            const params = JSON.parse(body);
            const arr = [];
            for(i in params) {
                arr.push(params[i]);
            }
            if(arr.some(e => !e)) {
                res.status(200).json({
                    resolved : false,
                    message : "Input error"
                })
            }
            else {
                add_user(params.name , params.email , params.category , resolvement => {
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

app.listen(port, () => {
    console.log("Server is running...");
});