import React from "react";
import { FiFacebook, FiTwitter, FiInstagram } from "react-icons/fi";

import { FooterOverlay, Newsletter } from "../../components";
import { images } from "../../constants";
import "./Footer.css";

const Footer = () => (
  <div className="app__footer section__padding" id="login">
    <FooterOverlay />
    <Newsletter />

    <div className="app__footer-links">
      <div className="app__footer-links_contact">
        <h1 className="app__footer-headtext">Kontaktirajte nas</h1>
        <p className="p__opensans">Bulevar Patrijarha Pavla 12, Novi Sad</p>
        <p className="p__opensans">
          <a href="tel:+381611970198">061/197-0198</a>
        </p>
        <p className="p__opensans">
          <a href="tel:+3810611970198">061/197-0198</a>
        </p>
      </div>

      <div className="app__footer-links_logo">
        <img src={images.logo} alt="footer_logo" />
        <p className="p__opensans">
          &quot;Najbolji način da pronađete sebe jeste da dođete kod nas!&quot;
        </p>
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
        <h1 className="app__footer-headtext">Radno Vreme</h1>
        <p className="p__opensans">Ponedeljak-Petak:</p>
        <p className="p__opensans">07:00 h - 23:00 h</p>
        <p className="p__opensans">Subota-Nedelja:</p>
        <p className="p__opensans">07:00 h - 00:00 h</p>
      </div>
    </div>

    <div className="footer__copyright">
      <p className="p__opensans">
        <span>2022 BuildUP</span>
      </p>
    </div>
  </div>
);

export default Footer;
