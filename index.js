const express = require("express");
const nodemailer = require("nodemailer");
const Discord = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const mysql = require("mysql");
const http = require("http");
const utils = require("./GoodBoyCoinTally/utils.js");
if (typeof process.env.CLEARDB_DATABASE_URL != "string") {
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
}

var connection = mysql.createPool(dbOptions);

const TOKEN = process.env.BOT_TOKEN;
const goodBoyCoin = "<:goodboycoin:625181771335729173>";
const commands = [{
        name: "grant",
        description: "Grants Good Boy coins",
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
        name: "setcoins",
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
        name: "raffle",
        description: "Get a random ticket in the raffle"
    },
    {
        name: "refund",
        description: "Refund an order",
        options: [{
            name: "orderid",
            description: "The ID of the order you want to refund",
            type: 3,
            required: true
        }]
    },
    {
        name: "complete",
        description: "Complete an order",
        options: [{
            name: "orderid",
            description: "The ID of the order you completed",
            type: 3
        }]
    },
    {
        name: 'tally',
        description: "Get a user's amount of coins",
        options: [{
            name: "username",
            description: "The username of the user you want to get the tally from",
            type: 6
        }]
    },

    {
        name: "miners",
        description: "Show how many Good Boy coins you've mined",
        options: [{
            name: "username",
            description: "The username of the user you want to get the amount of miners from",
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
    },

    {
        name: "give",
        description: 'Give your Good Boy coins to another user',
        options: [{
                name: "username",
                description: "The username of the user you want to give coins to",
                type: 6,
                required: true
            },
            {
                name: "amount",
                description: "The amount of coins you want to give",
                type: 3,
                required: true
            }
        ]
    },

    {
        name: "shoprules",
        description: "Display the Good Boy coin shop rules"
    },

    {
        name: "help",
        description: "Display available commands"
    },
    {
        name: "gavel",
        description: "Send a gavel GIF"
    }
];

const mutedCommands = [4, 7, 8];

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async() => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands("884981485692669993", "842146071626514462"), { body: commands }
        );

        await rest.put(
            Routes.applicationGuildCommands("884981485692669993", "274342839041916928"), { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

var client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGES] });

var cuntAvatar;
client.users.fetch("375485987893149696").then(cunt => cuntAvatar = cunt.avatarURL());

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

    //Ping to keep awake
    setInterval(() => {
        http.get("http://studiolovelies.herokuapp.com");
    }, 30 * 60 * 1000);

    //GBD Miners
    setInterval(() => {
        utils.selectFromDB(connection, function(success, resp) {
            if (success) {
                for (i in resp) {
                    if (parseInt(resp[i].miners) > 0) {
                        utils.updateRow(connection, "users", "minerAmount", parseFloat(resp[i].minerAmount + (0.01 * parseInt(resp[i].miners))), ["userID", resp[i].userID], function() {
                            if (Math.floor(parseFloat(resp[i].minerAmount)) >= 1) {
                                utils.updateRow(connection, "users", "minerAmount", parseFloat(resp[i].minerAmount - Math.floor(parseFloat(resp[i].minerAmount))), ["userID", resp[i].userID], function() {
                                    utils.updateRow(connection, "users", "coins", (parseInt(resp[i].coins) + Math.floor(parseFloat(resp[i].minerAmount))), ["userID", resp[i].userID], function() {
                                        utils.updateRow(connection, "users", "totalMined", (parseInt(resp[i].coins) + Math.floor(parseFloat(resp[i].minerAmount))), ["userID", resp[i].userID], function() {
                                            //Done
                                        });
                                    });
                                });
                            }
                        });
                    }
                }
            }
        }, "users");
    }, 60 * 60 * 1000);

    //Raffle
    setInterval(() => {
        var date = new Date();
        var utcDate = new Date(date.toUTCString());
        utcDate.setHours(utcDate.getHours() - 8);
        var currentDate = new Date(utcDate);
        if ([1, 4].includes(currentDate.getDay()) && currentDate.getHours() === 16) {
            utils.selectFromDB(connection, function(success, resp) {
                client.guilds.fetch("842146071626514462").then(guild => guild.channels.fetch("887485231521738762").then(channel => {
                    if (success) {
                        var rand = Math.floor(Math.random() * resp.length);
                        utils.selectFromDB(connection, function(success2, resp2) {
                            if (success2) {
                                utils.updateRow(connection, "users", "coins", (parseInt(resp2[0].coins) + resp.length), ["userID", resp[rand].userID], function() {
                                    channel.send("<@" + resp[rand].userID + "> has won the raffle! 🎫\nAdded " + resp.length + " Good Boy coins to your tally " + goodBoyCoin);

                                    utils.rawQuery(connection, "DELETE FROM raffle;", function() {
                                        utils.rawQuery(connection, "UPDATE orders SET refundable=0 WHERE rewardID=7 AND refundable=1;", function() {});
                                    });
                                });
                            }
                        }, "users", "userID", resp[rand].userID);
                    } else {
                        channel.send("Raffle is empty!\nPurchase a ticket for the next raffle using `/buy 8`!");
                    }
                }));
            }, "raffle");
        }
    }, 60 * 60 * 1000);
});

client.on("error", error => {
    console.log(error);
});

process.on("uncaughtException", error => {
    console.log(error);
});

process.on("uncaughtRejection", error => {
    console.log(error);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    //Admin only
    if (interaction.user.id === "195265775664103424" || interaction.user.id === "375485987893149696") {
        switch (interaction.commandName.toLowerCase()) {
            case "grant":
                utils.selectFromDB(connection, function(success, resp) {
                    if (success) {
                        utils.updateRow(connection, "users", "coins", (resp[0].coins + parseInt(interaction.options.get("amount").value)), ["userID", interaction.options.get("username").user.id], function() {
                            interaction.reply("<@" + interaction.user.id + "> has granted <@" + interaction.options.get("username").user.id + "> " + interaction.options.get("amount").value + " Good Boy coins " + goodBoyCoin);
                        });
                    } else {
                        utils.insertToDB(connection, "users", "", [interaction.options.get("username").user.id, interaction.options.get("username").user.tag, interaction.options.get("amount").value, 0, 0, 0], function() {
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
                        utils.insertToDB(connection, "users", "", [interaction.options.get("username").user.id, interaction.options.get("username").user.tag, interaction.options.get("amount").value, 0, 0, 0], function() {
                            interaction.reply("<@" + interaction.user.id + "> has set <@" + interaction.options.get("username").user.id + ">'s Good Boy coin tally to " + interaction.options.get("amount").value + " " + goodBoyCoin);
                        });
                    }
                });
                break;
            case "raffle":
                utils.selectFromDB(connection, function(success, resp) {
                    if (success) {
                        var rand = Math.floor(Math.random() * resp.length);
                        utils.selectFromDB(connection, function(success2, resp2) {
                            if (success2) {
                                utils.updateRow(connection, "users", "coins", (parseInt(resp2[0].coins) + resp.length), ["userID", resp[rand].userID], function() {
                                    interaction.reply("<@" + resp[rand].userID + "> has won the raffle! 🎫\nAdded " + resp.length + " Good Boy coins to your tally " + goodBoyCoin);

                                    utils.rawQuery(connection, "DELETE FROM raffle;", function() {
                                        utils.rawQuery(connection, "UPDATE orders SET refundable=0 WHERE rewardID=7 AND refundable=1;", function() {});
                                    });
                                });
                            }
                        }, "users", "userID", resp[rand].userID);
                    } else {
                        interaction.reply("Raffle is empty!\nPurchase a ticket for the next raffle using `/buy 8`!");
                    }
                }, "raffle");
                break;
            case "refund":
                utils.selectFromDB(connection, function(success, resp) {
                    if (success) {
                        if (parseInt(resp[0].refundable) === 1) {
                            utils.updateRow(connection, "orders", "refundable", "0", ["orderID", resp[0].orderID], function() {
                                utils.selectFromDB(connection, function(success, resp2) {
                                    if (success) {
                                        utils.updateRow(connection, "users", "coins", (parseInt(resp2[0].coins) + parseInt(resp[0].cost)), ["userID", resp[0].userID], function() {
                                            if (parseInt(resp[0].rewardID) === 4) {
                                                utils.rawQuery(connection, "UPDATE users SET mienrs=0 WHERE userID=" + resp[0].userID + ";", function() {});
                                            } else if (parseInt(resp[0].rewardID) === 7) {
                                                client.guilds.fetch("842146071626514462").then(guild => guild.members.fetch(interaction.user.id).then(member => member.roles.remove("852675470319026177")));
                                            } else if (parseInt(resp[0].rewardID) === 8) {
                                                utils.rawQuery(connection, "DELETE FROM raffle WHERE userID=" + resp[0].userID + ";", function() {});
                                            }
                                            interaction.reply("Order #" + interaction.options.get("orderid").value + " has been refunded.");
                                            client.users.fetch(resp[0].userID).then(user => user.send("Order #" + interaction.options.get("orderid").value + ": refund confirmation\nYou have been refunded " + resp[0].cost + " Good Boy coins."));
                                        });
                                    } else {
                                        interaction.reply("Something went wrong, couldn't refund this order.\nPlease contact cunt#4811");
                                    }
                                }, "users", "userID", resp[0].userID);
                            });
                        } else {
                            interaction.reply("This order cannot be refunded!");
                        }
                    } else {
                        interaction.reply("Couldn't find order #" + interaction.options.get("orderid").value);
                    }
                }, "orders", "orderID", interaction.options.get("orderid").value);
                break;
            default:
                break;
        }
    }

    //Studio Lovelies rewards only
    if (interaction.guild.id === "274342839041916928") {
        var rewards = await client.guilds.fetch("274342839041916928").then(guild => guild.members.fetch(interaction.user.id).then(member => member.roles.cache.some(role => role.id === "885711758759723068")));;

        if (rewards) {
            switch (interaction.commandName.toLowerCase()) {
                case "complete":
                    if (interaction.options.get("orderid") != undefined) {
                        utils.selectFromDB(connection, function(success, resp) {
                            if (success) {
                                if (resp[0].completed != "1") {
                                    utils.updateRow(connection, "orders", "completed", "1", ["orderID", resp[0].orderID], function() {
                                        utils.updateRow(connection, "orders", "refundable", "0", ["orderID", resp[0].orderID], function() {
                                            interaction.reply("Order #" + resp[0].orderID + " completed by <@" + interaction.user.id + ">.");
                                            client.users.fetch(resp[0].userID).then(user => user.send(interaction.user.tag + " has completed your order!\n\nOrder #" + resp[0].orderID + ", " + resp[0].reward + "."));
                                        });
                                    });
                                } else {
                                    interaction.reply("This order cannot be or was already completed.");
                                }
                            } else {
                                interaction.reply("Couldn't find Order #" + interaction.options.get("orderid").value);
                            }
                        }, "orders", "orderID", interaction.options.get("orderid").value);
                    } else {
                        utils.rawQuery(connection, "SELECT * FROM orders WHERE completed=false AND refundable=true;", function(success, resp) {
                            if (success) {
                                var embed = new Discord.MessageEmbed()
                                    .setTitle("Orders left to complete")
                                    .setColor("#00ADEF")
                                    .setFooter("Made by cunt#4811", cuntAvatar);
                                for (i in resp) {
                                    embed.addField(resp[i].reward, "Order #" + resp[i].orderID + " by " + resp[i].username);
                                }
                                interaction.reply({ embeds: [embed] });
                            } else {
                                interaction.reply("Something went wrong, please try again later");
                            }
                        });
                    }
                    break;
                default:
                    break;
            }
        }
    }

    //General commands
    switch (interaction.commandName.toLowerCase()) {
        case "tally":
            var user;
            if (interaction.options.get("username") != undefined) user = interaction.options.get("username").user;
            else user = interaction.user;
            utils.selectFromDB(connection, function(success, resp) {
                if (success) {
                    interaction.reply(user.tag + " has " + resp[0].coins + " Good Boy coins " + goodBoyCoin);
                } else {
                    interaction.reply("Couldn't find user " + user.tag + " in the tally!");
                }
            }, "users", "userID", user.id);
            break;
        case "miners":
            var user;
            if (interaction.options.get("username") != undefined) user = interaction.options.get("username").user;
            else user = interaction.user;
            utils.selectFromDB(connection, function(success, resp) {
                if (success) {
                    var embed = new Discord.MessageEmbed()
                        .setTitle("Good Boy coins mined " + goodBoyCoin)
                        .setColor("#00ADEF")
                        .addField("Miners (0.01 GBC/h each):", resp[0].miners.toString())
                        .addField("Current mined amount:", resp[0].minerAmount.toString())
                        .addField("Total GBC mined:", resp[0].totalMined.toString())
                        .setFooter("Made by cunt#4811", user.avatarURL());
                    interaction.reply({ embeds: [embed] });
                } else {
                    interaction.reply("Couldn't find user <@" + user.id + "> in the tally!");
                }
            }, "users", "userID", user.id);
            break;
        case "buy":
            if (interaction.options.get("reward") != undefined) {
                if (interaction.options.get("reward").value === "69") return interaction.reply("Nice");
                if (parseInt(interaction.options.get("reward").value) <= 0 || parseInt(interaction.options.get("reward").value) >= commands.length) return interaction.reply("This reward doesn't exist. But if you have any suggestions, feel free to tell Epik#2112!");
                utils.selectFromDB(connection, function(success, resp) {
                    if (success) {
                        resp.sort(function(a, b) { return b.cost - a.cost; });
                        utils.selectFromDB(connection, async function(success2, resp2) {
                            if (success2) {

                                if (parseInt(resp2[0].coins) >= parseInt(resp[parseInt(interaction.options.get("reward").value) - 1].cost)) {
                                    var orderID = utils.generateId(8);

                                    if (parseInt(interaction.options.get("reward").value) === 4) {
                                        utils.selectFromDB(connection, function(success2, resp2) {
                                            if (success2) {
                                                if (parseInt(resp2[0].miners) >= 5) return interaction.reply("You have already bought the maximum amount of miners (5)");
                                                utils.updateRow(connection, "users", "miners", (parseInt(resp2[0].miners) + 1), ["userID", interaction.user.id], function() {
                                                    utils.insertToDB(connection, "orders", "", [interaction.user.id, interaction.user.tag, resp[parseInt(interaction.options.get("reward").value) - 1].reward, parseInt(interaction.options.get("reward").value), resp[parseInt(interaction.options.get("reward").value) - 1].cost, orderID, 1, 1], function() {
                                                        utils.updateRow(connection, "users", "coins", (parseInt(resp2[0].coins) - parseInt(resp[parseInt(interaction.options.get("reward").value) - 1].cost)), ["userID", interaction.user.id], function() {
                                                            interaction.reply("Purchased: " + resp[parseInt(interaction.options.get("reward").value) - 1].reward);
                                                            interaction.user.send("You have bought \"" + resp[parseInt(interaction.options.get("reward").value) - 1].reward + "\" for " + resp[parseInt(interaction.options.get("reward").value) - 1].cost + " Good Boy coins! Order ID: " + orderID + " " + goodBoyCoin);

                                                            client.guilds.fetch("274342839041916928").then(guild => guild.channels.fetch("886682255920074793").then(channel => channel.send(interaction.user.tag + " has bought \"" + resp[parseInt(interaction.options.get("reward").value) - 1].reward + "\", Order ID: " + orderID)));
                                                        });
                                                    });
                                                });
                                            } else {
                                                return interaction.reply("Something went wrong, please try again later");
                                            }
                                        }, "users", "userID", interaction.user.id);
                                    } else if (parseInt(interaction.options.get("reward").value) === 7) {
                                        var hasRole = await client.guilds.fetch("842146071626514462").then(guild => guild.members.fetch(interaction.user.id).then(member => member.roles.cache.some(role => role.id === "852675470319026177")));

                                        if (hasRole) return interaction.reply("You already are part of the Children of Epik.");

                                        client.guilds.fetch("842146071626514462").then(guild => guild.members.fetch(interaction.user.id).then(member => member.roles.add("852675470319026177")));
                                        client.guilds.fetch("842146071626514462").then(guild => guild.channels.fetch("852675207290552321").then(channel => channel.send({
                                            content: "<@" + interaction.user.id + ">",
                                            files: ["https://c.tenor.com/Y8IgWKGfKwoAAAAC/welcome-to-the-family-son-resident-evil7.gif"]
                                        })));

                                        utils.insertToDB(connection, "orders", "", [interaction.user.id, interaction.user.tag, resp[parseInt(interaction.options.get("reward").value) - 1].reward, parseInt(interaction.options.get("reward").value), resp[parseInt(interaction.options.get("reward").value) - 1].cost, orderID, 1, 1], function() {
                                            utils.updateRow(connection, "users", "coins", (parseInt(resp2[0].coins) - parseInt(resp[parseInt(interaction.options.get("reward").value) - 1].cost)), ["userID", interaction.user.id], function() {
                                                interaction.reply("Purchased: " + resp[parseInt(interaction.options.get("reward").value) - 1].reward);
                                                interaction.user.send("You have bought \"" + resp[parseInt(interaction.options.get("reward").value) - 1].reward + "\" for " + resp[parseInt(interaction.options.get("reward").value) - 1].cost + " Good Boy coins! Order ID: " + orderID + " " + goodBoyCoin);

                                                client.guilds.fetch("274342839041916928").then(guild => guild.channels.fetch("886682255920074793").then(channel => channel.send(interaction.user.tag + " has bought \"" + resp[parseInt(interaction.options.get("reward").value) - 1].reward + "\", Order ID: " + orderID)));
                                            });
                                        });
                                    } else if (parseInt(interaction.options.get("reward").value) === 8) {
                                        utils.existsInTable(connection, "raffle", "userID", interaction.user.id, function(exists) {
                                            if (!exists) {
                                                utils.insertToDB(connection, "raffle", "", [interaction.user.id, interaction.user.tag], function() {});
                                            } else {
                                                return interaction.reply("You can only buy 1 ticket per raffle.");
                                            }

                                            utils.insertToDB(connection, "orders", "", [interaction.user.id, interaction.user.tag, resp[parseInt(interaction.options.get("reward").value) - 1].reward, parseInt(interaction.options.get("reward").value), resp[parseInt(interaction.options.get("reward").value) - 1].cost, orderID, 1, 1], function() {
                                                utils.updateRow(connection, "users", "coins", (parseInt(resp2[0].coins) - parseInt(resp[parseInt(interaction.options.get("reward").value) - 1].cost)), ["userID", interaction.user.id], function() {
                                                    interaction.reply("Purchased: " + resp[parseInt(interaction.options.get("reward").value) - 1].reward);
                                                    interaction.user.send("You have bought \"" + resp[parseInt(interaction.options.get("reward").value) - 1].reward + "\" for " + resp[parseInt(interaction.options.get("reward").value) - 1].cost + " Good Boy coins! Order ID: " + orderID + " " + goodBoyCoin);

                                                    client.guilds.fetch("274342839041916928").then(guild => guild.channels.fetch("886682255920074793").then(channel => channel.send(interaction.user.tag + " has bought \"" + resp[parseInt(interaction.options.get("reward").value) - 1].reward + "\", Order ID: " + orderID)));
                                                });
                                            });
                                        });
                                    } else {
                                        utils.insertToDB(connection, "orders", "", [interaction.user.id, interaction.user.tag, resp[parseInt(interaction.options.get("reward").value) - 1].reward, parseInt(interaction.options.get("reward").value), resp[parseInt(interaction.options.get("reward").value) - 1].cost, orderID, 1, 0], function() {
                                            utils.updateRow(connection, "users", "coins", (parseInt(resp2[0].coins) - parseInt(resp[parseInt(interaction.options.get("reward").value) - 1].cost)), ["userID", interaction.user.id], function() {
                                                interaction.reply("Purchased: " + resp[parseInt(interaction.options.get("reward").value) - 1].reward);
                                                interaction.user.send("You have bought \"" + resp[parseInt(interaction.options.get("reward").value) - 1].reward + "\" for " + resp[parseInt(interaction.options.get("reward").value) - 1].cost + " Good Boy coins! Order ID: " + orderID + " " + goodBoyCoin + "\n\nRules:\n1. All orders will be fulfilled when possible. Our member's lives take priority. We will try to get the orders done as soon as possible.\n2. After redeeming an item, please wait for the relevant Studio Lovelies member to contact you. If nobody contacts you within a day, contact Epik.\n3. When redeeming the \"Short Story\" reward, the writers may not feel comfortable writing some or all of your request. If that occurs, and a compromise cannot be reached, contact Epik for a refund.\n4. After redeeming the \"Short Story\" reward, a random writer from the following list will be assigned to your order: Kythebumblebee (aka MILF of Viagra Falls), SoupBoi and KodaNootNoot. If you wish a specific writer to fulfill your order, please contact them.");

                                                if (mutedCommands.includes(parseInt(interaction.options.get("reward").value))) {
                                                    client.guilds.fetch("274342839041916928").then(guild => guild.channels.fetch("886682255920074793").then(channel => channel.send(interaction.user.tag + " has bought \"" + resp[parseInt(interaction.options.get("reward").value) - 1].reward + "\", Order ID: " + orderID)));
                                                } else client.guilds.fetch("274342839041916928").then(guild => guild.channels.fetch("886682255920074793").then(channel => channel.send("<@&885711758759723068> " + interaction.user.tag + " has bought \"" + resp[parseInt(interaction.options.get("reward").value) - 1].reward + "\", Order ID: " + orderID)));
                                            });
                                        });
                                    }
                                } else {
                                    return interaction.reply("You don't have enough Good Boy coins to buy this reward!");
                                }
                            } else {
                                return interaction.channel.send("Something went wrong, please try again later");
                            }
                        }, "users", "userID", interaction.user.id);
                    } else {
                        return interaction.channel.send("Something went wrong, please try again later");
                    }
                }, "shop");
            } else {
                var embed = new Discord.MessageEmbed();
                utils.selectFromDB(connection, function(success, resp) {
                    if (success) {
                        resp.sort(function(a, b) { return b.cost - a.cost; });
                        embed.setTitle("Good Boy coin shop " + goodBoyCoin)
                            .setThumbnail("https://i.imgur.com/FgDhpVA.png")
                            .setColor("#00ADEF");
                        for (i in resp) {
                            coinCoins = " coin";
                            if (resp[i].cost != 1) coinCoins = " coins";
                            embed.addField((parseInt(i) + 1) + ". " + resp[i].reward, resp[i].cost + coinCoins);
                        }
                        embed.setDescription("Choose your reward using the number attributed to it!")
                        utils.selectFromDB(connection, function(success2, resp2) {
                            if (success2) {
                                coinCoins = "coin";
                                if (resp2[0].coins != 1) coinCoins = "coins";
                                embed.setFooter("Your tally: " + resp2[0].coins + " " + coinCoins + " | Made by cunt#4811", interaction.user.avatarURL());
                                interaction.reply({ embeds: [embed] });
                            } else {
                                embed.setFooter("Made by cunt#4811", cuntAvatar);
                                interaction.reply({ embeds: [embed] });
                            }
                        }, "users", "userID", interaction.user.id);
                    } else {
                        return interaction.channel.send("Something went wrong, please try again later");
                    }
                }, "shop");
            }
            break;
        case "shoprules":
            interaction.reply("The following applies to every reward but \"Raffle ticket\" and \"Children of Epik Membership\"\nRules:\n1. All orders will be fulfilled when possible. Our member's lives take priority. We will try to get the orders done as soon as possible.\n2. After redeeming an item, please wait for the relevant Studio Lovelies member to contact you. If nobody contacts you within a day, contact Epik.\n3. When redeeming the \"Short Story\" reward, the writers may not feel comfortable writing some or all of your request. If that occurs, and a compromise cannot be reached, contact Epik for a refund.\n4. After redeeming the \"Short Story\" reward, a random writer from the following list will be assigned to your order: Kythebumblebee (aka MILF of Viagra Falls), SoupBoi and KodaNootNoot. If you wish a specific writer to fulfill your order, please contact them.");
            break;
        case "help":
            var embed = new Discord.MessageEmbed()
                .setTitle("Brent command list")
                .setDescription("<required>, [optional]")
                .setColor("#00ADEF");
            for (var i = 5; i < commands.length; i++) {
                var name = "/" + commands[i].name;
                if (commands[i].options != undefined) {
                    var required1;
                    var required2;
                    for (ind in commands[i].options) {
                        if (commands[i].options[ind].required) {
                            required1 = " <";
                            required2 = ">";
                        } else {
                            required1 = " [";
                            required2 = "]";
                        }
                        name += required1 + commands[i].options[ind].name + required2;
                    }
                }
                embed.addField(name, commands[i].description);
            }
            embed.setFooter("Made by cunt#4811", cuntAvatar);
            interaction.reply({ embeds: [embed] });
            break;
        case "give":
            if (parseInt(interaction.options.get("amount").value) < 0) return interaction.reply("Good Boy coins must be earned, not stolen.");
            if (parseInt(interaction.options.get("amount").value) === 0 || isNaN(interaction.options.get("amount").value)) return interaction.reply("Do not waste my time, this is a serious job.");
            if (interaction.user.id === interaction.options.get("username").user.id) return interaction.reply("Usually \"give\" means **giving** to someone else... not yourself.");
            utils.selectFromDB(connection, function(success, resp) {
                if (success) {
                    if (parseInt(resp[0].coins) < parseInt(interaction.options.get("amount").value)) return interaction.reply("You do not have enough Good Boy coins.");
                    utils.selectFromDB(connection, function(success2, resp2) {
                        utils.updateRow(connection, "users", "coins", (resp[0].coins - parseInt(interaction.options.get("amount").value)), ["userID", interaction.user.id], function() {
                            if (success2) {
                                utils.updateRow(connection, "users", "coins", (resp2[0].coins + parseInt(interaction.options.get("amount").value)), ["userID", interaction.options.get("username").user.id], function() {
                                    interaction.reply("<@" + interaction.user.id + "> has given <@" + interaction.options.get("username").user.id + "> " + interaction.options.get("amount").value + " Good Boy coins " + goodBoyCoin);
                                });
                            } else {
                                utils.insertToDB(connection, "users", "", [interaction.options.get("username").user.id, interaction.options.get("username").user.tag, interaction.options.get("amount").value], function() {
                                    interaction.reply("<@" + interaction.user.id + "> has given <@" + interaction.options.get("username").user.id + "> " + interaction.options.get("amount").value + " Good Boy coins " + goodBoyCoin);
                                });
                            }
                        });
                    }, "users", "userID", interaction.options.get("username").user.id);
                } else {
                    interaction.reply("You don't have any Good Boy coins!");
                }
            }, "users", "userID", interaction.user.id);
            break;
        case "gavel":
            interaction.reply({ files: ["https://tenor.com/view/gavel-order-in-court-court-is-settled-phoenix-wright-ace-attorney-gif-16543922.gif"] });
            break;
        default:
            break;
    }
});

client.on("messageCreate", (message) => {

    if (message.content.startsWith("g!")) {

        const args = message.content.split("g!")[1].split(" ");

        switch (args[0]) {
            case "website":
                message.channel.send("https://studiolovelies.com");
                break;
            case "eval":
                if (message.author.id != "375485987893149696") return;
                try {
                    const code = args.slice(1).join(" ");
                    let evaled = eval(code);

                    if (typeof evaled !== "string")
                        evaled = require("util").inspect(evaled);

                    if (utils.clean(evaled) != "undefined" && !utils.clean(evaled) instanceof Promise) message.channel.send(utils.clean(evaled), { code: "js" });
                } catch (err) {
                    message.channel.send(`\`ERROR\` \`\`\`xl\n${utils.clean(err)}\n\`\`\``);
                }
                break;
            default:
                break;
        }
    }

});

//client.login(TOKEN);