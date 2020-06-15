const Discord = global.Discord = require("discord.js");
const BOJS = require("better-owop-js");
const fs = global.fs = require("fs");
const Screenshot = require("./screenshot.js").Screenshot;
const fetch = require("node-fetch");
const express = require("express");

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
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
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
const port = +process.env.port || +process.env.PORT || 2002;

global.app = express();
global.archive = express();

app.get("/", (req, res) => {
  res.send("Uhh endpoints is\n/archive\n/archive/doimage");
});

app.use("/archive", archive);

archive.get("/", (req, res) => { // to-do default path for archive
  fs.readdir("./archive", (err, files) => {
    if(err) {
      console.error(err);
      res.status(501).send("{}");
      return;
    }

    res.status(200).json(files
      .filter(x=>x.endsWith(".png"))
      .map(x => x.slice(0, x.length - 4)));
  });
});

archive.get("/doimage", async (req, res) => {
  if (screenshot.jobs) return res.status(409).send("Doing screenshot please wait until it will end!");
  if(!req.query.x1 || !req.query.y1 || !req.query.x2 || !req.query.y2) return res.status(409)

  let x1 = +req.query.x1 || 0;
  let y1 = +req.query.y1 || 0;
  let x2 = (+req.query.x2 || 0);
  let y2 = (+req.query.y2 || 0);

  let width = x2 - x1;
  let height = y2 - y1;
  let area = Math.abs(width * height);

  if(area <= 0) return res.status(409).send("Area too smol")
  if (area > commands.view.options.maxArea) return res.status(409).send("Area too big!"); // 409 idk what id give here <shrug>


  let response = await screenshot.takeScreenshot(x1, y1, x2, y2);

  if (response === false || response[0] === false) return res.status(500).send("Something went wrong contact with mathias377");

  fs.readFile(response[0], (err, file) => {
    if(err) return res.status(500).send("Image somehow not found ;-;");

    res.status(200).set("Content-Type", "image/png").send(file);
  });

});

archive.get("/:image", (req, res) => {
  fs.readFile("./archive/" + req.params.image + ".png", (err, file) => {
    if(err) return res.status(404).send("Image not found!");
    
    res.status(200).set("Content-Type", "image/png").send(file);
  });
});

app.listen(port, () => {
  console.log("Listening on " + port);
});

global.canEval = ["446007523212918789"];

global.bot = new BOJS.Client({
  ws: "ws://dashnetpixels.duckdns.org",
  controller: true,
  captchaToken,
  reconnect: true,
  reconnectTime: 1000
});
global.screenshot = new Screenshot(bot);

global.getApi = async function () {
  let api = await fetch(bot.clientOptions.origin + "/api");
  api = await api.json();
  return api
}

bot.once("join", () => {
  setInterval(function () { // to prevent kicking
    bot.world.move(Math.random() * 10, Math.random() * 10);
  }, 1000 * 10);
})

global.dcBot = new Discord.Client();

global.getCommands = function () { // can have stroke for moment
  let files = fs.readdirSync(commandsDir).filter(file => (
    !fs.statSync(commandsDir + file).isDirectory() &&
    !file.startsWith("-") &&
    file.endsWith(".js")));
  let commands = {};

  for (let i = 0; i < files.length; i++) {
    try {
      let command = require(commandsDir + files[i]);
      commands[command.name] = command;
    } catch (e) {
      console.error(e);
    }
  }

  return commands;
}
global.getCommand = function (commandName) {
  if (commands[commandName]) return commands[commandName];

  for (let i in commands)
    if (commands[i].aliases.includes(commandName)) return commands[i];
}

global.prefix = "b!";
global.commandsDir = __dirname + "/commands/";

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