import React from "react";
import { useTranslation } from "react-i18next";
import { FiFacebook, FiTwitter, FiInstagram } from "react-icons/fi";

import { FooterOverlay, Newsletter } from "../../components";
import { images } from "../../constants";
import "./Footer.css";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <div className="app__footer section__padding" id="login">
      <FooterOverlay />
      <Newsletter />

      <div className="app__footer-inner">
        <div className="app__footer-links">
          <div className="app__footer-links_contact">
            <h1 className="app__footer-headtext">{t("contact_us")}</h1>
            <p className="p__opensans">{t("contact_address")}</p>
            <p className="p__opensans">
              <a href="tel:+381611970198">061/197-0198</a>
            </p>
            <p className="p__opensans">
              <a href="tel:+3810611970198">061/197-0198</a>
            </p>
          </div>

          <div className="app__footer-links_logo">
            <img src={images.logo} alt="footer_logo" />
            <div className="app__footer-links_icons">
              <a
                href="https://www.facebook.com/pizzerialivornonovisad"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                <FiFacebook />
              </a>
              <a href="http://" target="_blank" rel="noopener noreferrer">
                <FiTwitter />
              </a>
              <a
                href="https://www.instagram.com/pizzeria_livorno"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                <FiInstagram />
              </a>
            </div>
          </div>

          <div className="app__footer-links_work">
            <h1 className="app__footer-headtext">{t("working_hours_title")}</h1>
            <p className="p__opensans">{t("working_hours.weekdays")}</p>
            <p className="p__opensans">{t("working_hours.weekends")}</p>
          </div>
        </div>

        <div className="footer__copyright">
          <p
            className="p__opensans"
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
          <a
            href="https://jovanportfolio.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website author portfolio"
            className="footer__author"
          >
            <span className="footer__authorText">Website by Jovan</span>
          </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
