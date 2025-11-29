import { HashRouter, Routes, Route, Link } from "react-router";
import React from "react";
import TopTabs from "./TopTabs";
import Timer from "./Timer";
import Settings from "./Settings";

export default function Dashboard() {
  return (
    <div className="h-screen bg-slate-50">
      <HashRouter>
        <TopTabs/>
        <Routes>
          <Route path="timer" element={<Timer/>}></Route>
          <Route path="settings" element={<Settings/>}></Route>
        </Routes>
      </HashRouter>
    </div>
  );
}
