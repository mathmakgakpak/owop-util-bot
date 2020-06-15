module.exports = {
  name: "help",
  description: "Guess",
  aliases: [],
  run(message, args) {
    let commandName = args[0];
    if (commandName) {
      let command = getCommand(commandName);
      if (!command) return message.channel.send("Command not found");
      const embed = new Discord.MessageEmbed()
        .setColor(utils.rgbToHex(...utils.randomColor()))
        .addField("Command name", command.name)
        .addField("Description", command.description)
        .addField("Aliases", command.aliases.length ? command.aliases.join(", ") : "none");

      message.channel.send(embed);
    } else {
      let string = "";
      for (let i in commands) {
        let command = commands[i];
        string += `${command.name} - ${command.description}\n`;
      }

      const embed = new Discord.MessageEmbed()
        .setColor(utils.rgbToHex(...utils.randomColor()))
        .addField("Prefix", prefix)
        .addField("Commands", utils.format.code(string, ""))


      message.channel.send(embed);
    }
  }
}
