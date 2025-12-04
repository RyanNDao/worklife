import { contextBridge, ipcRenderer } from "electron";
import { EVENTS } from "../shared/constants";
import { TimerState } from "./timerState"; // or wherever it lives

const TIMER_UPDATE_CHANNEL = "timer:update"; // In place of event constant

contextBridge.exposeInMainWorld("electronAPI", {
  onTimerUpdate: (callback: (arg0: TimerState) => void) => {
    ipcRenderer.on(TIMER_UPDATE_CHANNEL, (event, data) => {
      callback(data);
    });
  },
});
