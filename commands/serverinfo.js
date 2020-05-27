module.exports = {
  name: "serverinfo",
  aliases: ["botinfo"],
  description: "Views info about bot's server",
  async run(message, args) {
    let api = await getApi();
    delete api.yourIp;
    delete api.yourConns;
    delete api.banned;
    delete api.numSelfBans;
    api = JSON.stringify(api, null, 2);
    const embed = new Discord.MessageEmbed()
    .setColor(utils.rgbToHex(...utils.randomColor()))
    .addField("ws", bot.clientOptions.ws)
    .addField("origin", bot.clientOptions.origin)
    .addField("world", bot.world.name)
    .addField("users online", Object.keys(bot.players).length)
    .addField("api", utils.format.code(api, "json"));
    message.channel.send(embed);
  }
}
