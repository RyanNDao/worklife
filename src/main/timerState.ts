import { app } from "electron";
import path from "path";
import fs from "fs";
import { EventEmitter } from "events";
import { EVENTS } from "../shared/constants";

type TimerStatus = "RUNNING" | "PAUSED" | "BREAK";
export interface TimerState {
  currentCountdownMs: number;
  status: TimerStatus;
}

interface TimerStateData {
  filePath: string;
  fileContent: TimerState;
}

const writeIntervalMs = 30 * 1000; // 30 seconds
let tickCount = 0;
const tickIntervalMs = 1 * 1000; // 1 second
const timerStateFileName = "timerState.json";
let timerState: TimerState;
let tickTimer: NodeJS.Timeout,
  emitTimer: NodeJS.Timeout,
  writeTimer: NodeJS.Timeout;
const newTimerTimeMs = 1 * 60 * 1000;
const breakTimeMs = 45 * 1000;
const thresholdTimeMs = 30 * 1000; // Fallback delay time in case timeTilBreakMs is 0 immediately on startup
const newTimerData: TimerState = {
  currentCountdownMs: newTimerTimeMs,
  status: "RUNNING",
};

export const timerEmitter = new EventEmitter();
export const initTimer = () => {
  loadTimerStateFromFile();
  // Fallback time delay so break time doesn't start too soon on startup
  if (timerState.currentCountdownMs <= thresholdTimeMs) {
    timerState.currentCountdownMs = thresholdTimeMs;
    timerState.status = "RUNNING";
  }
  timerEmitter.emit(EVENTS.TIMER.BEGIN);
  tickTimer = setInterval(onTick, tickIntervalMs);
  emitTimer = setInterval(emitTimerStatus, tickIntervalMs); // Emit event every second
};

const emitTimerStatus = () => {
  // Given the status, emit the event and the state itself
  const statusMapper: Record<TimerStatus, string> = {
    RUNNING: EVENTS.TIMER.RUNNING,
    BREAK: EVENTS.TIMER.ON_BREAK,
    PAUSED: EVENTS.TIMER.PAUSED,
  };
  timerEmitter.emit(statusMapper[timerState.status], timerState);
};

const writeTimerStateToFile = () => {
  // Write new timer state to file
  fs.writeFileSync(
    path.join(app.getPath("userData"), timerStateFileName),
    JSON.stringify(timerState)
  );
  console.log(JSON.stringify(timerState));
};

const onTick = () => {
  tickCount++
  checkTimer()

  // If the writeIntervalMs is reached based on number of ticks (1 tick = 1000ms = 1 second)
  if (writeIntervalMs / tickCount === 1000) {
    writeTimerStateToFile();
    tickCount = 0;
  }
}

const checkTimer = () => {
  let nextStatus: TimerStatus, nextEvent, nextTimerMs;

  // Handle next events
  if (timerState.status === "RUNNING") {
    nextStatus = "BREAK";
    nextEvent = EVENTS.TIMER.START_BREAK;
    nextTimerMs = breakTimeMs;
  } else if (timerState.status === "BREAK") {
    nextStatus = "RUNNING";
    nextEvent = EVENTS.TIMER.RUNNING;
    nextTimerMs = newTimerTimeMs;
  } else {
    throw new Error(`Unhandled timer status: ${timerState.status}`);
  }

  // Tick timer and transition states if countdown is met
  timerState.currentCountdownMs -= tickIntervalMs;
  if (timerState.currentCountdownMs <= 0) {
    timerState.status = nextStatus;
    timerEmitter.emit(nextEvent);
    timerState.currentCountdownMs = newTimerTimeMs;
  }
};

const pauseTimer = () => {
  clearInterval(tickTimer);
  timerState.status = "PAUSED";
  // Write new timer state to file
  console.log(JSON.stringify(timerState));
  fs.writeFileSync(
    path.join(app.getPath("userData"), timerStateFileName),
    JSON.stringify(timerState)
  );
  timerEmitter.emit(EVENTS.TIMER.PAUSED);
};

const getTimerStateData = (): TimerStateData => {
  const filePath = path.join(app.getPath("userData"), timerStateFileName);
  let fileContent = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
    : undefined;
  return { filePath, fileContent };
};

const loadTimerStateFromFile = () => {
  let timerData = getTimerStateData();
  console.log(app.getPath("userData"), JSON.stringify(timerData.fileContent));
  // If no timer data is returned, set new state in file
  if (!timerData.fileContent) {
    fs.writeFileSync(
      path.join(app.getPath("userData"), timerStateFileName),
      JSON.stringify(newTimerData)
    );
    timerState = newTimerData;
  } else {
    timerState = timerData.fileContent;
  }
  console.log("init timer", JSON.stringify(timerState));
};
