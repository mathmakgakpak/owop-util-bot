module.exports = {
  name: "help",
  description: "Guess",
  aliases: [],
  run(message, args) {
    let commandName = args[0];
    if(commandName) {
      let command = getCommand(commandName);
      if(!command) return message.channel.send("Command not found");

      message.channel.send(`**${command.name}**\nDescription: ${command.description}\nAliases: ${command.aliases.length ? command.aliases.join(", ") : "none"}`);
    } else {
      let string = "Commands:\n";
      for(let i in commands) {
        let command = commands[i];
        string += `${prefix}${command.name} - ${command.description}\n`;
      }
      message.channel.send(string);
    }
  }
}
