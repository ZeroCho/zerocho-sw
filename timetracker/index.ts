import activeWindow from 'active-win';
import robot from 'robotjs';
import { uIOhook } from 'uiohook-napi';
import fs from 'fs/promises';
import path from "path";

uIOhook.on('keydown', (e) => {
  keyboardHoldingSec = 0;
  isTracking = true;
})
uIOhook.start();

const MOUSE_HOLDING_THRESHOLD = 10;
const KEYBOARD_HOLDING_THRESHOLD = 10;
let acc: Record<string, number> = {};
let isTracking = false;
let prevMousePos: { x: number, y: number } = robot.getMousePos();
let mouseHoldingSec = 0;
let keyboardHoldingSec = 0;

(async () => {
  try {
    const today = new Date();
    const data = await fs.readFile(
      path.join('data', `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}.txt`),
    );
    console.log(data.toString());
    acc = JSON.parse(data.toString());
  } catch (err) {
    console.log('기존 파일 없음', err);
  }
  setInterval(async () => {
    keyboardHoldingSec += 1;
    const currentMousePos = robot.getMousePos();
    if (prevMousePos.x === currentMousePos.x && prevMousePos.y === currentMousePos.y) {
      mouseHoldingSec += 1;
    } else {
      mouseHoldingSec = 0;
      isTracking = true;
    }
    prevMousePos = currentMousePos;
    if (mouseHoldingSec > MOUSE_HOLDING_THRESHOLD && keyboardHoldingSec > KEYBOARD_HOLDING_THRESHOLD) {
      isTracking = false;
    }
    if (!isTracking) {
      return console.log('컴퓨터 쉬는 중...');
    }
    const result = await activeWindow();
    if (result?.owner.name) {
      if (acc[result.owner.name]) {
        acc[result.owner.name] += 1;
      } else {
        acc[result.owner.name] = 1;
      }
    }
    console.log(acc, keyboardHoldingSec, mouseHoldingSec, isTracking);
    const today = new Date();
    await fs.writeFile(
      path.join('data', `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}.txt`),
      JSON.stringify(acc),
    );
  }, 1000);
})();
