const express = require("express");
const nodemailer = require("nodemailer");
const Discord = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const mysql = require("mysql");
const http = require("http");

var app = express();
app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.listen(
    PORT,
    () => console.log("Website live and listening on port " + PORT)
);

dbOptions = {};

if (process.env.CLEARDB_DATABASE_URL != undefined) {
    dbOptions = {
        host: process.env.CLEARDB_DATABASE_URL.split(/\/|@/g)[3],
        user: process.env.CLEARDB_DATABASE_URL.split(/\/|@/g)[2].split(":")[0],
        password: process.env.CLEARDB_DATABASE_URL.split(/\/|@/g)[2].split(":")[1],
        database: process.env.CLEARDB_DATABASE_URL.split(/\/|@/g)[4].split("?")[0],
        flags: "-FOUND_ROWS"
    };
}

var connection = mysql.createPool(dbOptions);

const TOKEN = process.env.BOT_TOKEN;
const goodBoyCoin = "<:goodboycoin:625181771335729173>";

const mutedCommands = [4, 7, 8];

const rest = new REST({ version: '9' }).setToken(TOKEN);

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

        console.error("contact form")
    }
});

app.get("*", (req, res) => {
    return res.status(404).sendFile("404.html", { root: "public/views" });
});


process.on("uncaughtException", error => {
    console.log(error);
});

process.on("uncaughtRejection", error => {
    console.log(error);
});