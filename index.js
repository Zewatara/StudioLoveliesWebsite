const express = require("express");
const nodemailer = require("nodemailer");
const { getMaxListeners } = require("process");

var app = express();
app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

console.log(process.env.EMAIL, process.env.PASSWORD);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
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

var sess;

app.get("/", (req, res) => {
    return res.sendFile("index.html", { root: "public/views" });
});

app.get("/about", (req, res) => {
    return res.sendFile("about.html", { root: "public/views" });
});

app.get("/projects", (req, res) => {
    return res.sendFile("projects.html", { root: "public/views" });
});

app.get("/contact", (req, res) => {
    return res.sendFile("contact.html", { root: "public/views" });
});

app.post("/contact", (req, res) => {
    if (req.query.sendEmail == "" || req.query.sendEmail == true) {

        const mail = {
            from: req.body.email,
            to: process.env.EMAIL,
            subject: req.body.subject,
            text: req.body.message,
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