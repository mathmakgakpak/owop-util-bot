module.exports = {
  name: "about",
  aliases: [],
  description: "About bot",
  run(message) {
    const embed = new Discord.MessageEmbed()
      .setColor(utils.rgbToHex(...utils.randomColor()))
      .addField("author", "mathias377#3326 id: 446007523212918789") // remember you can't edit author cuz of mit license
      .addField("Bot github link", "[github](https://github.com/mathmakgakpak/owop-util-bot)");
    message.channel.send(embed);
  }
}
