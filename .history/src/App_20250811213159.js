import React from "react";
import { Routes, Route } from "react-router-dom";
import ReactGA from "react-ga4";

import HomePage from "./pages/HomePage";
import "./App.css";

ReactGA.initialize("G-EVKLDJZFZE");

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/delivery" element={<OnlineOrderingPage />} />
    </Routes>
  );
};

export default App;
