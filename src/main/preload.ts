import { contextBridge, ipcRenderer } from "electron";
import { EVENTS } from "../shared/constants";
import { TimerState } from "./timerState";

const TIMER_UPDATE_CHANNEL = "timer:update"; // TODO: Fix this so we can get it from the constants file

contextBridge.exposeInMainWorld("electronAPI", {
  onTimerUpdate: (callback: (arg0: TimerState) => void) => {
    ipcRenderer.on(EVENTS.IPC_CHANNELS.TIMER_UPDATE, (event, data) => {
      callback(data);
    });
  },
});
