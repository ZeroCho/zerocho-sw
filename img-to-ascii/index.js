const flat = require('array.prototype.flat');
const quantize = require('quantize');
const pixels = require('image-pixels');
const savePixels = require('save-pixels');
const fs = require('fs');
const pngjs = require('pngjs');
const ndarray = require('ndarray');

const { PNG } = pngjs;

const main = async () => {
  const { data, width, height } = await pixels('./npm.png');
  const divisor = 10;
  const widthSection = Math.ceil(width / divisor);
  const heightSection = Math.ceil(height / divisor);
  console.log(widthSection, heightSection);
  const matrix = Array(heightSection).fill().map(() => []);
  for (let i = 0; i < heightSection; i++) {
    for (let j = 0; j < widthSection; j++) {
      const arrayOfPixels = [];
      for (let k = i * divisor; k < (i + 1) * divisor; k++) { // k줄
        for (let l = j * divisor; l < (j + 1) * divisor; l++) { // l칸
          arrayOfPixels.push([
            data[k * width * 4 + l * 4],
            data[k * width * 4 + l * 4 + 1],
            data[k * width * 4 + l * 4 + 2],
            data[k * width * 4 + l * 4 + 3],
          ]);
        }
      }
      // console.log(heightSection, widthSection, arrayOfPixels);
      const colorMap = quantize(arrayOfPixels, 2);
      const palette = colorMap.palette();
      i < 2 && j < 2 && console.log(i, j, arrayOfPixels);
      matrix[i][j] = palette[0];
    }
  }
  console.log(width, height, divisor, flat(matrix, 2).length);
  const png = new PNG({
    width: width / divisor,
    height: height / divisor,
  });
  png.data = flat(matrix, 2);
  png.pack().pipe(fs.createWriteStream('npmresult.png'));
};

main();
