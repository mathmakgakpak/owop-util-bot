module.exports = {
  name: "eval",
  aliases: ["execute"],
  description: "evals code",
  run(message, args) {
    if(canEval.includes(message.author.id)) return message.channel.send("You can't use eval!");
    let toEval = args.join(" ");

    try {
      let output = eval(toEval);
      console.log(utils.randomColor())
      const embed = new Discord.MessageEmbed()
      .setColor(utils.rgbToHex(...utils.randomColor()))
      .addField("Output", utils.format.code(output))
      .addField("Type", utils.format.code(typeof output));
      message.channel.send(embed);
    } catch(e) {
      console.error(e);
      let stringErr = String(e);
      stringErr = stringErr.length > 500 ? stringErr.splice(500) + "..." : stringErr;
      const embed = new Discord.MessageEmbed()
      .setColor(utils.rgbToHex(...utils.randomColor()))
      .addField("Error", utils.format.code(stringErr));
      message.channel.send(embed);
    }
  }
}
