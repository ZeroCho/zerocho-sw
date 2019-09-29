const flat = require('array.prototype.flat');
const quantize = require('quantize');
const pixels = require('image-pixels');
const output = require('image-output');
const fs = require('fs');

const horizontalDivisor = 40;
const verticalDivisor = 40;
const filePath = './zerocho.jpg';
const color = true;

const ascii = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ';

const main = async () => {
  const { data, width, height } = await pixels(filePath);
  const widthSection = Math.ceil(width / horizontalDivisor);
  const heightSection = Math.ceil(height / verticalDivisor);
  console.log(widthSection, heightSection);
  const matrix = Array(heightSection).fill().map(() => []);
  for (let i = 0; i < heightSection; i++) {
    for (let j = 0; j < widthSection; j++) {
      const arrayOfPixels = [];
      for (let k = i * verticalDivisor; k < (i + 1) * verticalDivisor; k++) { // k줄
        for (let l = j * horizontalDivisor; l < (j + 1) * horizontalDivisor; l++) { // l칸
          arrayOfPixels.push([
            data[k * width * 4 + l * 4],
            data[k * width * 4 + l * 4 + 1],
            data[k * width * 4 + l * 4 + 2],
          ]);
        }
      }
      // console.log(heightSection, widthSection, arrayOfPixels);
      const colorMap = quantize(arrayOfPixels, 2);
      const palette = colorMap.palette();
      // i < 2 && j < 2 && console.log(i, j, arrayOfPixels);
      // console.log(i, j, palette);
      matrix[i][j] = [palette[0][0], palette[0][1], palette[0][2], 255];
      if (!color) {
        const rgb = matrix[i][j];
        let b = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.11 * rgb[2];
        b = b < 128 ? Math.max(0, b * 0.7) : Math.min(255, b * 1.4);
        matrix[i][j] = [b, b, b];
      }
    }
  }
  console.log(width, height, horizontalDivisor, verticalDivisor, flat(matrix, 2).length);
  // console.log('matrix', matrix);
  const brightness = matrix.map((row) => {
    return row.map((rgb) => {
      if (color) {
        const b = 0.2125862307855955516 * rgb[0] + 0.7151703037034108499 * rgb[1] + 0.07220049864333622685 * rgb[2];
        return `<span style="color:rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]});">${ascii[Math.floor(b / ascii.length)]}</span>`;
      }
      return `<span>${ascii[Math.floor(rgb[0] / (255 / (ascii.length - 1)))]}</span>`;
    });
  });
  // console.log('flat', flat(matrix, 2).slice(0, 30));
  fs.writeFileSync(
    'index.html',
    `<pre style="transform: scale(0.5);line-height:10px;letter-spacing: 3px">${brightness.map((row) => row.join('')).join('<br/>')}</pre>`
  );
  output({
    data: flat(matrix, 2),
    width: widthSection,
    height: heightSection,
  }, 'zerochoresult.jpg');
  console.timeEnd('timer');
};

console.time('timer');
main();
