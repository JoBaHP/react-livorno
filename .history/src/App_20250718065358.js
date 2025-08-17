import React from "react";
import {
  AboutUs,
  Chef,
  FindUs,
  Footer,
  Gallery,
  Header,
  Intro,
  Laurels,
} from "./container";
import { Navbar, Modal } from "./components";
import "./App.css";
import ReactGA from "react-ga4";
import { useEffect, useState } from "react";

ReactGA.initialize("G-EVKLDJZFZE");
ReactGA.send("pageview");

//const imageUrl = require("./assets/chicken.jpg");

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  /*   useEffect(() => {
    setIsModalOpen(true); // Open modal on page load
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  }; */

  return (
    <div>
      <Navbar />
      <Header />
      {/*} {isModalOpen && <Modal imageUrl={imageUrl} onClose={closeModal} />} */}
      <AboutUs />
      {/* <SpecialMenu /> */}
      <Chef />
      <Intro />
      <Laurels />
      <Gallery />
      <FindUs />
      <Footer />
    </div>
  );
};

export default App;
