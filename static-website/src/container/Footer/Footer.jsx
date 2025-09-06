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
          <p className="p__opensans">{t("footer_quote")}</p>
          <img
            src={images.spoon}
            className="spoon__img"
            style={{ marginTop: 15 }}
            alt="logo livorno"
          />
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
        <p className="p__opensans">
          <a
            href="https://www.linkedin.com/in/jovan-raosavljevic"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Jovan Raosavljevic LinkedIn"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            2022 Jovan R.
          </a>
        </p>
      </div>
    </div>
  );
};

export default Footer;
