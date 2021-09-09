const express = require("express");
const nodemailer = require("nodemailer");
const mysql = require("mysql");
const utils = require("./utils");

var app = express();
app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.EMAIL || undefined,
        pass: process.env.PASSWORD || undefined,
    },
});

transporter.verify(function(error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

app.listen(
    PORT,
    () => console.log("App live and listening on port " + PORT)
);

var connection = mysql.createPool({
    host: process.env.CLEARDB_DATABASE_URL.split(/\/|@/g)[3],
    user: process.env.CLEARDB_DATABASE_URL.split(/\/|@/g)[2].split(":")[0],
    password: process.env.CLEARDB_DATABASE_URL.split(/\/|@/g)[2].split(":")[1],
    database: process.env.CLEARDB_DATABASE_URL.split(/\/|@/g)[4].split("?")[0],
    flags: "-FOUND_ROWS"
});

app.get("/", (req, res) => {
    return res.sendFile("index.html", { root: "public/views" });
});

app.get("/about", (req, res) => {
    if (req.query && req.query.getTally != undefined) {
        utils.selectFromDB(connection, function(success, resp) {
            if (success) {
                return res.send({
                    status: "ok",
                    data: resp
                });
            } else {
                return res.send({
                    status: "error",
                    error: resp
                });
            }
        }, "users", "", "");
    } else return res.sendFile("about.html", { root: "public/views" });
});

app.get("/projects", (req, res) => {
    return res.sendFile("projects.html", { root: "public/views" });
});

app.get("/contact", (req, res) => {
    return res.sendFile("contact.html", { root: "public/views" });
});

app.get("/epik", (req, res) => {
    return res.sendFile("epik.html", { root: "public/views" });
    //return res.sendFile("damedaepik.mp4", { root: "public/assets" });
});

app.post("/contact", (req, res) => {
    if (req.query.sendEmail == "" || req.query.sendEmail == true) {

        const mail = {
            from: process.env.EMAIL,
            to: process.env.EMAIL,
            subject: req.body.subject,
            text: req.body.message + "\n\nSent from: " + req.body.email,
        };

        transporter.sendMail(mail, (err, data) => {
            if (err) {
                return res.send({
                    status: "error",
                    error: "An internal server error occured",
                    message: err
                });
            } else {
                return res.send({
                    status: "ok",
                    success: true
                });
            }
        });
    }
});

app.get("*", (req, res) => {
    return res.status(404).sendFile("404.html", { root: "public/views" });
});