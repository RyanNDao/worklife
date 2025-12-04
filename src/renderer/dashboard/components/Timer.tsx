import { useEffect, useState } from "react";
import { TimerState } from "../../../main/timerState";

export default function Timer() {
  let [timerStateObject, setTimerStateObject] = useState<TimerState>();
  useEffect(() => {
    window.electronAPI.onTimerUpdate((timerState) => {
      console.log("Received timer update:", timerState);
      setTimerStateObject(timerState);
    });
  }, []);

  return <>timer contents {timerStateObject?.currentCountdownMs} {timerStateObject?.status} </>;
}
