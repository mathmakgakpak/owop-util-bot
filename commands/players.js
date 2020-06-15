module.exports = {
  name: "ids",
  aliases: ["players"],
  description: "Views list of players",
  run(message, args) {
    const embed = new Discord.MessageEmbed()
      .setColor(utils.rgbToHex(...utils.randomColor()))
      .addField("ids", utils.format.code(Object.keys(bot.players).join(", ")));
    message.channel.send(embed)
  }
}
