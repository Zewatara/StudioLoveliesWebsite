const express = require("express");
const nodemailer = require("nodemailer");

// var app = express();
// app.use(express.static(__dirname + '/public'));

// const PORT = process.env.PORT || 3000;

// app.use(express.json());
// app.set('views', __dirname + '/public/views');
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     auth: {
//         user: process.env.SMTP_USERNAME,
//         pass: process.env.SMTP_PASSWORD,
//     },
// });

// transporter.verify(function(error, success) {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log("Mail server is ready to take messages");
//     }
// });

// // app.listen(
// //     PORT,
// //     () => console.log("Website live and listening on port " + PORT)
// // );

// app.get("/", (req, res) => {
//     return res.sendFile("index.html", { root: "public/views" });
// });

// app.get("/about", (req, res) => {
//     return res.sendFile("about.html", { root: "public/views" });
// });

// app.get("/projects", (req, res) => {
//     return res.sendFile("projects.html", { root: "public/views" });
// });

// app.get("/contact", (req, res) => {
//     return res.sendFile("contact.html", { root: "public/views" });
// });

// app.get("/epik", (req, res) => {
//     return res.sendFile("epik.html", { root: "public/views" });
//     //return res.sendFile("damedaepik.mp4", { root: "public/assets" });
// });

// app.post("/contact", (req, res) => {
//     if (req.query.sendEmail == "" || req.query.sendEmail == true) {

//         const mail = {
//             from: process.env.SMTP_FROM,
//             to: process.env.SMTP_TO,
//             subject: req.body.subject,
//             text: req.body.message + "\n\nSent from: " + req.body.email,
//         };

//         transporter.sendMail(mail, (err, data) => {
//             if (err) {
//                 return res.send({
//                     status: "error",
//                     error: "An internal server error occured",
//                     message: err,
//                     data
//                 });
//             } else {
//                 return res.send({
//                     status: "ok",
//                     success: true
//                 });
//             }
//         });
//     }
// });

// app.get("*", (req, res) => {
//     return res.status(404).sendFile("404.html", { root: "public/views" });
// });

process.on("uncaughtException", error => {
    console.log(error);
});

process.on("uncaughtRejection", error => {
    console.log(error);
});