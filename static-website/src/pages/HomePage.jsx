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
import Maintenance from "../components/Maintenance/Maintenance"; // Adjust path as needed
import ReactGA from "react-ga4";

const HomePage = () => {
  const isMaintenanceMode = true; // Set to true to enable maintenance mode

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: "/", title: "Home Page" });
  }, []);

  if (isMaintenanceMode) {
    return <Maintenance />;
  }

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
