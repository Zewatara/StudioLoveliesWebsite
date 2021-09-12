const express = require("express");
const nodemailer = require("nodemailer");
const Discord = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const mysql = require("mysql");
const utils = require("./GoodBoyCoinTally/utils");
if (process.env.CLEARDB_DATABASE_URL === undefined) {
    const config = require("./GoodBoyCoinTally/config.json");
}

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

dbOptions = {};

if (process.env.CLEARDB_DATABASE_URL != undefined) {
    dbOptions = {
        host: process.env.CLEARDB_DATABASE_URL.split(/\/|@/g)[3],
        user: process.env.CLEARDB_DATABASE_URL.split(/\/|@/g)[2].split(":")[0],
        password: process.env.CLEARDB_DATABASE_URL.split(/\/|@/g)[2].split(":")[1],
        database: process.env.CLEARDB_DATABASE_URL.split(/\/|@/g)[4].split("?")[0],
        flags: "-FOUND_ROWS"
    };
} else {
    dbOptions = {
        host: config.dbUrl,
        user: config.dbUser,
        password: config.dbPass,
        database: config.dbName,
        flags: "-FOUND_ROWS"
    };
}

var connection = mysql.createPool(dbOptions);

const TOKEN = process.env.BOT_TOKEN || config.token;
const goodBoyCoin = "<:goodboycoin:625181771335729173>";
const commands = [{
        name: 'grant',
        description: 'Grants Good Boy coins',
        options: [{
                name: "username",
                description: "The username of the user you want to grant coins to",
                type: 6,
                required: true
            },
            {
                name: "amount",
                description: "The amount of coins you want to grant",
                type: 3,
                required: true
            }
        ]
    },
    {
        name: 'setcoins',
        description: "Sets someone's Good Boy coin tally",
        options: [{
                name: "username",
                description: "The username of the user you want to set the tally of",
                type: 6,
                required: true
            },
            {
                name: "amount",
                description: "The amount of coins you want to set",
                type: 3,
                required: true
            }
        ]
    },
    {
        name: 'tally',
        description: 'Grants Good Boy coins',
        options: [{
            name: "username",
            description: "The username of the user you want to get the tally from",
            type: 6
        }]
    },

    {
        name: "buy",
        description: "Buy something from the shop with your Good Boy coins",
        options: [{
            name: "reward",
            description: "The reward of your choice",
            type: 3
        }]
    }
];

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async() => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands("884981485692669993", "274342839041916928"), { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

var client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS] });

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

client.on("ready", () => {
    console.info("Ready");
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.user.id === "195265775664103424" || interaction.user.id === "375485987893149696") {
        switch (interaction.commandName.toLowerCase()) {
            case "grant":
                utils.selectFromDB(connection, function(success, resp) {
                    if (success) {
                        utils.updateRow(connection, "users", "coins", (parseInt(interaction.options.get("amount").value) + resp[0].coins), ["userID", interaction.options.get("username").user.id], function() {
                            interaction.reply("<@" + interaction.user.id + "> has granted <@" + interaction.options.get("username").user.id + "> " + interaction.options.get("amount").value + " Good Boy coins " + goodBoyCoin);
                        });
                    } else {
                        utils.insertToDB(connection, "users", "", [interaction.options.get("username").user.id, interaction.options.get("username").user.tag, interaction.options.get("amount").value], function() {
                            interaction.reply("<@" + interaction.user.id + "> has granted <@" + interaction.options.get("username").user.id + "> " + interaction.options.get("amount").value + " Good Boy coins " + goodBoyCoin);
                        });
                    }
                }, "users", "userID", interaction.options.get("username").user.id);
                break;
            case "setcoins":
                utils.existsInTable(connection, "users", "userID", interaction.options.get("username").user.id, function(exists) {
                    if (exists) {
                        utils.updateRow(connection, "users", "coins", interaction.options.get("amount").value, ["userID", interaction.options.get("username").user.id], function() {
                            interaction.reply("<@" + interaction.user.id + "> has set <@" + interaction.options.get("username").user.id + ">'s Good Boy coin tally to " + interaction.options.get("amount").value + " " + goodBoyCoin);
                        });
                    } else {
                        utils.insertToDB(connection, "users", "", [interaction.options.get("username").user.id, interaction.options.get("username").user.tag, interaction.options.get("amount").value], function() {
                            interaction.reply("<@" + interaction.user.id + "> has set <@" + interaction.options.get("username").user.id + ">'s Good Boy coin tally to " + interaction.options.get("amount").value + " " + goodBoyCoin);
                        });
                    }
                });
                break;
            case "tally":
                var user;
                if (interaction.options.get("username") != undefined) user = interaction.options.get("username").user.id;
                else user = interaction.user.id;
                utils.selectFromDB(connection, function(success, resp) {
                    if (success) {
                        interaction.reply("<@" + user + "> has " + resp[0].coins + " Good Boy coins " + goodBoyCoin);
                    } else {
                        interaction.reply("Couldn't find user <@" + user + "> in the tally!");
                    }
                }, "users", "userID", user);
                break;
            default:
                break;
        }
    }

    switch (interaction.commandName.toLowerCase()) {
        case "buy":
            if (interaction.options.get("reward") != undefined) {
                utils.selectFromDB(connection, function(success, resp) {
                    if (success) {
                        resp.sort(function(a, b) { return b.cost - a.cost; });
                        utils.selectFromDB(connection, function(success2, resp2) {
                            if (success2) {
                                utils.updateRow(connection, "users", "coins", (parseInt(resp2[0].coins) - parseInt(resp[parseInt(interaction.options.get("reward").value) - 1].cost)), ["userID", interaction.user.id], function() {
                                    interaction.reply("Purchased: " + resp[parseInt(interaction.options.get("reward").value) - 1].reward);
                                    interaction.user.send("You have bought \"" + resp[parseInt(interaction.options.get("reward").value) - 1].reward + "\" for " + resp[parseInt(interaction.options.get("reward").value) - 1].cost + " Good Boy coins! " + goodBoyCoin + "\n\nRules:\n1. All orders will be fulfilled when possible. Our member's lives take priority. We will try to get the orders done as soon as possible.\n2. After redeeming an item, please wait for the relevant Studio Lovelies member to contact you. If nobody contacts you within a day, contact Epik.\n3. When redeeming the \"Short Story\" reward, the writers may not feel comfortable writing some or all of your request. If that occurs, and a compromise cannot be reached, contact Epik for a refund.\n4. After redeeming the \"Short Story\" reward, a random writer from the following list will be assigned to your order: Kythebumblebee (aka MILF of Viagra Falls), SoupBoi and KodaNootNoot. If you wish a specific writer to fulfill your order, please contact them.");
                                    interaction.guild.channels.fetch("886682255920074793").then(channel => channel.send("<@&885711758759723068> " + interaction.user.tag + " has bought \"" + resp[parseInt(interaction.options.get("reward").value) - 1].reward + "\""));
                                });
                            } else {
                                return interaction.reply("Something went wrong, please try again later " + resp);
                            }
                        }, "users", "userID", interaction.user.id);
                    } else {
                        return interaction.reply("Something went wrong, please try again later");
                    }
                }, "shop");
            } else {
                var embed = new Discord.MessageEmbed();
                utils.selectFromDB(connection, function(success, resp) {
                    if (success) {
                        resp.sort(function(a, b) { return b.cost - a.cost; });
                        embed.setTitle("Good Boy coin shop " + goodBoyCoin)
                            .setThumbnail("https://i.imgur.com/BCGOkDM.png")
                            .setColor('#00ADEF');
                        for (i in resp) {
                            embed.addField((parseInt(i) + 1) + ". " + resp[i].reward, resp[i].cost + " Coins");
                        }
                        embed.setDescription("Choose your reward using the number attributed to it!")
                            .setFooter("Made by cunt#4811");
                        interaction.reply({ embeds: [embed] });
                    } else {
                        return interaction.reply("Something went wrong, please try again later");
                    }
                }, "shop");
            }
            break;
        default:
            break;
    }
});

client.login(TOKEN);