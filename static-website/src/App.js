import React from "react";
import { Routes, Route } from "react-router-dom";
import ReactGA from "react-ga4";
import OnlineOrderingPage from "./pages/OnlineOrderingPage";
import HomePage from "./pages/HomePage";
import { ApiProvider } from "./ApiProvider";
import "./App.css";

ReactGA.initialize("G-EVKLDJZFZE");

const App = () => {
  return (
    <ApiProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/delivery" element={<OnlineOrderingPage />} />
      </Routes>
    </ApiProvider>
  );
};

export default App;
