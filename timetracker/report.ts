import fs from 'fs/promises';
import path from "path";

const today = new Date();
(async () => {
  try {
    const data = await fs.readFile(
      path.join('data', `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}.txt`),
    );
    console.log(data.toString());
    const json = JSON.parse(data.toString());
  } catch (err) {
    console.error(err);
  }
})();
