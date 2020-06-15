module.exports = {
  name: "whois",
  aliases: ["info"],
  description: "Views info about player",
  run(message, args) {
    let id = args[0];
    if (!id) return message.channel.send("Not engough args!");
    let player = bot.players[id];
    if (!player) return message.channel.send("Player not found!");


    message.channel.send(`Info about player with id ${player.id}\nnick: ${player.nick || "no data"}\nrank: ${player.rank}\nposition: ${player.x}, ${player.y}\nselected color: ${JSON.stringify(player.color)}`);
  }
}
