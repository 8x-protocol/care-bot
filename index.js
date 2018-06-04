const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
require("dotenv").config({path: './keys/.env'});
const token = process.env.TELEGRAMTOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Admins
const admins = ['kermankohli', 'axeleriksson', 'travisdmathis', 'ReneeZhou', 'KKKKKevin', 'andy_tee'];

// Firebase setup
var firebase = require("firebase-admin");

var serviceAccount = require("./keys/service-key.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://care-bot-4c42d.firebaseio.com"
});

// Command for giving love

bot.onText(/\/givelove (?<=^|(?<=[^a-zA-Z0-9-_\.]))@([A-Za-z]+[A-Za-z0-9-_]+) ?(\d+$)?/, (msg, match) => {

        if (!admins.includes(msg.from.username)) {
            return;
        }

        const chatId = msg.chat.id;
        const userToAward = match[1];
        const amount = match[2] || 1;

        console.log(msg);

        bot.sendMessage(chatId, "@" + userToAward + " has been awarded " + amount + " \u{2764}");

        var ref = firebase.database().ref(chatId + "/" + userToAward);
        var isFirst = false;

        ref.child('/count').transaction(function(count) {
            if (!count && count == 0) {
                isFirst = true;
            }
            return (count || 0) + parseInt(amount);
        });

        if (isFirst) {
            ref.child('/created_at').set(firebase.database.ServerValue.TIMESTAMP);
        }
});

// Command for checking how much love you have

bot.onText(/\/getlove (?<=^|(?<=[^a-zA-Z0-9-_\.]))@([A-Za-z]+[A-Za-z0-9-_]+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const userToAward = match[1] || msg.from.username;

    firebase.database().ref(chatId + "/" + userToAward + "/count").once('value').then(function(snapshot) {
        var count = snapshot.val() || 0;
        bot.sendMessage(chatId, "@" + userToAward + " has " + count + " \u{2764}");
    });

});