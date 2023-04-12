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
    console.log(result);
    if (result?.owner.name) {
      if (result.owner.name === 'Google Chrome') {
        if (result.title.includes("Stack Overflow")) {
          if (!acc["Stack Overflow"]) {
            acc["Stack Overflow"] = 0;
          }
          acc["Stack Overflow"] += 1;
        } else if (result.title.includes("Gmail")) {
          if (!acc["Gmail"]) {
            acc["Gmail"] = 0;
          }
          acc["Gmail"] += 1;
        } else if (result.title.includes("GitHub")) {
          if (!acc["GitHub"]) {
            acc["GitHub"] = 0;
          }
          acc["GitHub"] += 1;
        } else if (result.title.includes("TypeScript")) {
          if (!acc["TypeScript"]) {
            acc["TypeScript"] = 0;
          }
          acc["TypeScript"] += 1;
        } else if (result.title.includes("MDN")) {
          if (!acc["MDN"]) {
            acc["MDN"] = 0;
          }
          acc["MDN"] += 1;
        } else if (result.title.includes("인프런")) {
          if (!acc["인프런"]) {
            acc["인프런"] = 0;
          }
          acc["인프런"] += 1;
        } else if (result.title.includes("npm")) {
          if (!acc["npm"]) {
            acc["npm"] = 0;
          }
          acc["npm"] += 1;
        }
      }
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
