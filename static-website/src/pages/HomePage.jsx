import React, { useEffect } from "react";
import {
  AboutUs,
  Chef,
  FindUs,
  Footer,
  Gallery,
  Header,
  Intro,
  Laurels,
} from "../container";
import { Navbar } from "../components";
import ReactGA from "react-ga4";

const HomePage = () => {
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: "/", title: "Home Page" });
  }, []);
  return (
    <div>
      <Navbar />
      <Header />
      <AboutUs />
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
