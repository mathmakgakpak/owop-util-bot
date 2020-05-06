function radiusToArea(radius) {
  return Math.pow(2, radius * 2);
}

module.exports = {
  name: "view",
  description: "Views chunks on owop",
  options: {
    maxArea: radiusToArea(1000)
  },
  radiusToArea,
  aliases: [],
  async run(message, args) {
    if (args.length < 1) return message.channel.send("Not engough args");
    args = args.map(x => +x);
    if (args.find(x => isNaN(x))) return message.channel.send("One of args is not number!");

    if (screenshot.jobs) return message.channel.send("Doing screenshot please wait until it will end!");

    if (args.length < 4) {
      let radius = Math.abs(args[0]);
      let area = this.radiusToArea(radius);

      if (area > this.options.maxArea) return message.channel.send("Too big area! max: " + this.options.maxArea);
      let x = args[1];
      let y = args[2];

      let response = await screenshot.takeScreenshotRadius(radius, x, y);

      if (response === false || response[0] === false) return message.channel.send("Something went wrong contact with mathias377");

      message.channel.send(`${message.author.username} Here is image time took to do it ${response[2] - response[1]}ms`, {
        files: [
          response[0]
        ]
      })
    } else {
      let x1 = args[0];
      let y1 = args[1];
      let x2 = args[2];
      let y2 = args[3];
      x1 = x1 < x2 ? x1 : x2;
      y1 = y1 < y2 ? y1 : y2;
      x2 = x1 > x2 ? x1 : x2;
      y2 = y1 > y2 ? y1 : y2;
      let canvasWidth = x2 - x1;
      let canvasHeight = y2 - y1;
      let area = canvasHeight * canvasWidth;

      if (Math.abs(area) > this.options.maxArea) return message.channel.send("Too big area! max: " + maxArea);

      let response = await screenshot.takeScreenshot(x1, y1, x2, y2);
      if (response === false || response[0] === false) return message.channel.send("Something went wrong contact with mathias377");


      message.channel.send(`${message.author.username} here is image time took to do it ${response[2] - response[1]}ms`, {
        files: [
          response[0]
        ]
      })
    }
  }
}
