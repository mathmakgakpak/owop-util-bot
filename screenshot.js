const util = require("util");
const Canvas = require("canvas");
const fs = require("fs");

const writeFile = util.promisify(fs.writeFile);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addAlphaToData(data, imageData, alpha = 255) {
  if(data.length % 3 !== 0) throw new Error("Data is not data ;-;");
  //let newData = new Uint8Array(data.length + data.length/3);

  for(let i = 0, i2 = 0; i < imageData.data.length;) imageData.data[i++] = i % 4 === 0 ? alpha : data[i2++];
  return imageData;
}

function absMod(n1, n2) {
	return ((n1 % n2) + n2) % n2;
}

class Screenshot {
	constructor(bot, imagesPath = "./archive/", chunksBreak = 15000, sleepTimeout = 1000 * 7) {
		if(!bot) throw new Error("Bot argument is in the wrong format");
		if(!fs.existsSync(imagesPath)) {
			fs.mkdirSync(imagesPath);
		}
		bot.setMaxListeners(0);
		this.imagesPath = imagesPath;
		this.bot = bot;
		this.jobs = 0;
		this.chunksBreak = chunksBreak;
		this.sleepTimeout = sleepTimeout;
	}
	async requestArea(x1, y1, x2, y2) {
	  x1 = Math.floor(x1 / 16);
	  y1 = Math.floor(y1 / 16);
	  x2 = Math.floor(x2 / 16);
	  y2 = Math.floor(y2 / 16);

	  //console.log("requesting area");
	  let i = 0;
	  let chunksLasted = (x2 - x1 + 1) * (y2 - y1 + 1);
	  //console.log(chunksLasted)
	  return new Promise(async resolve => {
	    if (this.bot.ws.readyState !== 1) return resolve(false);
	    for (let xx = x1; xx <= x2; xx++) {
	      for (let yy = y1; yy <= y2; yy++) {
					while (this.bot.ws.readyState !== 1) await sleep(1000);
					if(this.bot.chunkSystem.getChunk(xx, yy)) {
						chunksLasted--;
						if (chunksLasted === 0) resolve();
					} else {
						i++;
						this.bot.world.requestChunk(xx, yy).then(() => {
		          chunksLasted--;
		          if (chunksLasted === 0) resolve();
		        });
						if (i % this.chunksBreak === 0 && this.sleepTimeout !== 0) {
		          console.log("sleeping for "+(this.sleepTimeout/1000)+" secs", chunksLasted, i);
		          await sleep(this.sleepTimeout);
		        }
					}
	      }
	    }
	    //console.log(i)
	  });
	}
	putOnCanvas(x1, y1, x2, y2) {
	  let canvasWidth = x2 - x1;
	  let canvasHeight = y2 - y1;

	  let canvas = new Canvas.Canvas(canvasWidth, canvasHeight);
	  let ctx = canvas.getContext("2d");
	  //console.log("putting on canvas");


	  let x1c = Math.floor(x1 / 16);
	  let y1c = Math.floor(y1 / 16);
	  let x2c = Math.floor(x2 / 16);
	  let y2c = Math.floor(y2 / 16);


	  for (let canvasX = -Math.abs(absMod(x1,16)), xx = x1c; xx <= x2c; xx++, canvasX+=16) { // TO-DO fix that it
	    for (let canvasY = -Math.abs(absMod(y1,16)), yy = y1c; yy <= y2c; yy++, canvasY+=16) {
				//console.log(canvasX, canvasY)
	      let chunk = this.bot.chunkSystem.getChunk(xx, yy);
	      if (!chunk) continue;
				let imgData = addAlphaToData(chunk, ctx.createImageData(16, 16));


	      ctx.putImageData(imgData, canvasX, canvasY);
	    }
	  }
	  return canvas;
	}
	async save(canvas) {
	  //console.log("saving");
	  let fileName = `${this.imagesPath}${Date.now()}.png`
	  try {
	    await writeFile(fileName, canvas.toBuffer());
	    //console.log("done");
	    return fileName;
	    return
	  } catch (e) {
	    console.error(e);
	    return false;
	  }
	}
	async takeScreenshot(x1=0, y1=0, x2=1, y2=1) {
	  x1 = x1 < x2 ? x1 : x2;
	  y1 = y1 < y2 ? y1 : y2;
	  x2 = x1 > x2 ? x1 : x2;
	  y2 = y1 > y2 ? y1 : y2;
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    x2 = Math.round(x2);
    y2 = Math.round(y2);
    let canvasWidth = x2 - x1;
    let canvasHeight = y2 - y1;
    let area = canvasHeight * canvasWidth;
    if(area === 0) throw new Error("Can not do image with 0 pixels :drrr:");

	  let start = Date.now();
		this.jobs++;
	  if (await this.requestArea(x1, y1, x2, y2) === false) {
			this.jobs--;
			return false;
		}
	  let canvas = await this.putOnCanvas(x1, y1, x2, y2);

	  let fileName = await this.save(canvas);

		this.jobs--;
	  return [fileName, start, Date.now()];
	}
	async takeScreenshotRadius(radius, x = 0, y = 0) {
	  let x1 = x - radius;
	  let y1 = y - radius;
	  let x2 = x + radius;
	  let y2 = y + radius;
	  //console.log(x1, y1, x2, y2)

	  return await this.takeScreenshot(x1, y1, x2, y2);
	}
}

module.exports = {
	Screenshot,
	addAlphaToData,
	absMod
}
