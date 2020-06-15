function radiusToArea(radius) {
  return Math.pow(radius * 2, 2);
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
    if (screenshot.jobs) return message.channel.send("Doing screenshot please wait until it will end!");

    let response;
    if (args.length === 3 || args.length === 1) {
      let radius = Math.abs(+args[0]) || 1;
      let area = this.radiusToArea(radius);

      if (area > this.options.maxArea) return message.channel.send("Too big area! max: " + this.options.maxArea);
      let x = +args[1] || 0;
      let y = +args[2] || 0;

      response = await screenshot.takeScreenshotRadius(radius, x, y);
    } else if (args.length === 4) {
      let x1 = +args[0] || 0;
      let y1 = +args[1] || 0;
      let x2 = +args[2] || 0;
      let y2 = +args[3] || 0;

      let width = x2 - x1;
      let height = y2 - y1;
      let area = width * height;

      if (Math.abs(area) > this.options.maxArea) return message.channel.send("Too big area! max: " + maxArea);

      response = await screenshot.takeScreenshot(x1, y1, x2, y2);
    } else {
      message.channel.send("view x1 y1 x2 y2\nview radius x y");
      return;
    }

    if (response === false || response[0] === false) return message.channel.send("Something went wrong contact with mathias377");

    message.channel.send(`${message.author.username} Here is image time took to do it ${response[2] - response[1]}ms`, {
      files: [
        response[0]
      ]
    });
  }
}
