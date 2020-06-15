module.exports = {
  name: "reload",
  aliases: [],
  description: "Reloads command(s)",
  run(message, args) {
    if (!canEval.find(x=> x == message.author.id)) return message.channel.send("You can't use reload!");

    let commandName = args[0];
    if (commandName) {
      try {
        let command = require(commandsDir + commandName);
        commands[command.name] = command;
      } catch (e) {
        console.error(e);
        message.channel.send("Error while loading command!");
      }
    } else {
      commands = getCommands();
      console.log("Reloaded Commands");
      message.channel.send("Reloaded commands.")
    }
  }
}
