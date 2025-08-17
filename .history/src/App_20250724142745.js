import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import ReactGA from "react-ga4";

import HomePage from "./HomePage";
import OrderingSystem from "./OrderingSystem";
import "./App.css";

ReactGA.initialize("G-EVKLDJZFZE");

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/order" element={<OrderingSystem />} />

      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
};

export default App;
