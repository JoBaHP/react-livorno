import React, { useState, useEffect } from "react";
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
import ReactGA from "react-ga4";

const imageUrl = require("./assets/chicken.jpg");

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Send a pageview event for the homepage
    ReactGA.send({ hitType: "pageview", page: "/", title: "Home Page" });

    // Open modal on page load
    setIsModalOpen(true);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <Navbar />
      <Header />
      {isModalOpen && <Modal imageUrl={imageUrl} onClose={closeModal} />}
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

export default HomePage;
