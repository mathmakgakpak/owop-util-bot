const Discord = global.Discord = require("discord.js");
const BOJS = require("better-owop-js");
const fs = require("fs");
const Screenshot = require("./screenshot.js").Screenshot;
const fetch = require("node-fetch");

require('custom-env').env();

let captchaToken = fs.readFileSync("captchaToken.txt", {
  encoding: "utf8"
});


global.utils = {
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  randomColor() {
    return [utils.random(0, 255), utils.random(0, 255), utils.random(0, 255)];
  },
  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  },
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  format: {
    code(string, type = "js") {
      return "```" + `${string ? type : ""}\n${string}` + "```";
    },
    embed(string) {
      return "`" + string + "`";
    },
    italic(string) {
      return "*" + string + "*";
    },
    bold(string) {
      return "**" + string + "**";
    },
    strikethrough(string) {
      return "~~" + string + "~~";
    }
  }
}

global.canEval = [446007523212918789];

global.bot = new BOJS.Client({
  //ws: "ws://dashnetpixels.duckdns.org",
  controller: true,
  captchaToken,
  reconnect: true,
  reconnectTime: 1000
});
global.screenshot = new Screenshot(bot);

global.getApi = async function() {
  let api = await fetch(bot.clientOptions.origin + "/api");
  api = await api.json();
  return api
}

bot.on("join", () => {
  setInterval(function() { // to prevent kicking
    bot.world.move(Math.random() * 10, Math.random() * 10);
  }, 1000 * 10);
})

global.dcBot = new Discord.Client();

global.getCommands = function() {
  let files = fs.readdirSync(commandsDir).filter(file => (
    !fs.statSync(commandsDir + file).isDirectory() &&
    !file.startsWith("-") &&
    file.endsWith(".js")));
  let commands = {};

  for (let i = 0; i < files.length; i++) {
    let command = require(commandsDir + files[i]);
    commands[command.name] = command;
  }

  return commands;
}
global.getCommand = function(commandName) {
  if (commands[commandName]) return commands[commandName];

  for (let i in commands)
    if (commands[i].aliases.includes(commandName)) return commands[i];
}

global.prefix = "b2!";
global.commandsDir = "./commands/";

global.commands = getCommands();


dcBot.on("message", message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  let [commandName, ...args] = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);

  let command = getCommand(commandName);
  if (!command) return;
  try {
    command.run(message, args, commandName);
  } catch (e) {
    console.error(e);
    message.channel.send("Something went wrong...");
  }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


dcBot.login(process.env.dcToken);
console.log("started " + Date.now())
