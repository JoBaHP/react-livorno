import React, {Suspense} from "react";
import { Routes, Route } from "react-router-dom";
import ReactGA from "react-ga4";
import { ApiProvider } from "./ApiProvider";
import "./App.css";

const OnlineOrderingPage = React.lazy(() => import("./pages/OnlineOrderingPage"));
const HomePage = React.lazy(() => import("./pages/HomePage"));


ReactGA.initialize("G-EVKLDJZFZE");

const App = () => {
  return (
    <ApiProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/delivery" element={<OnlineOrderingPage />} />
        </Routes>
      </Suspense>
    </ApiProvider>
  );
};

export default App;
