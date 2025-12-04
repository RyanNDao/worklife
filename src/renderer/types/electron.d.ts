import { TimerState } from "../../main/timerState";

export interface ElectronAPI {
  onTimerUpdate: (callback: (data: TimerState) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
