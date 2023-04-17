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
let acc: Record<string, Record<string, number>> = {};
let isTracking = false;
let prevMousePos: { x: number, y: number } = robot.getMousePos();
let mouseHoldingSec = 0;
let keyboardHoldingSec = 0;

(async () => {
  const today = new Date();
  const todayString = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;
  if (!acc[todayString]) {
    acc[todayString] = {};
  }
  try {
    const data = await fs.readFile(
      path.join('data', `${todayString}.txt`),
    );
    console.log(data.toString());
    acc[todayString] = JSON.parse(data.toString()) as Record<string, number>;
  } catch (err) {
    console.log('기존 파일 없음', err);
  }
  setInterval(async () => {
    const today = new Date();
    const todayString = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;
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
    console.log(result);
    if (result?.owner.name) {
      if (result.owner.name === 'Google Chrome') {
        ["Stack Overflow", 'Gmail', 'GitHub', 'TypeScript', 'MDN', '인프런', 'npm'].every((el) => {
          if (result.title.includes(el)) {
            if (!acc[todayString][el]) {
              acc[todayString][el] = 0;
            }
            acc[todayString][el] += 1;
            return false;
          }
          return true;
        })
      }
      if (acc[todayString][result.owner.name]) {
        acc[todayString][result.owner.name] += 1;
      } else {
        acc[todayString][result.owner.name] = 1;
      }
    }
    console.log(acc[todayString], todayString, keyboardHoldingSec, mouseHoldingSec);
    await fs.writeFile(
      path.join('data', `${todayString}.txt`),
      JSON.stringify(acc),
    );
  }, 1000);
})();
