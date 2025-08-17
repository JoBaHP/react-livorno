import React from "react";
import { Routes, Route } from "react-router-dom";
import ReactGA from "react-ga4";

import HomePage from "./HomePage";
import "./App.css";

ReactGA.initialize("G-EVKLDJZFZE");

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
};

export default App;
