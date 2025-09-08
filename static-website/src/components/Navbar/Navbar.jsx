import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import images from "../../constants/images";
import "./Navbar.css";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [toggleMenu, setToggleMenu] = React.useState(false);
  return (
    <nav className="app__navbar">
      <div className="app__navbar-logo" style={{ cursor: "pointer" }} onClick={() => navigate("/") }>
        <img src={images.logo} alt="app__logo" />
      </div>
      <div style={{ position: "absolute", right: 16, top: 12, display: "flex", gap: 8 }}>
        <button
          onClick={() => i18n.changeLanguage("en")}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid #555",
            background: i18n.language?.startsWith("en") ? "#DCCA87" : "transparent",
            color: "#fff",
            cursor: "pointer",
          }}
          aria-label="Switch to English"
        >
          EN
        </button>
        <button
          onClick={() => i18n.changeLanguage("sr")}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid #555",
            background: i18n.language?.startsWith("sr") ? "#DCCA87" : "transparent",
            color: "#fff",
            cursor: "pointer",
          }}
          aria-label="Prebaci na srpski"
        >
          SR
        </button>
      </div>
      <ul className="app__navbar-links">
        <li className="p__opensans">
          <Link to="/#home">{t("home")}</Link>
        </li>
        <li className="p__opensans">
          <Link to="/#about">{t("about")}</Link>
        </li>
        <li className="p__opensans">
          <button
            type="button"
            className="custom__button"
            onClick={() => navigate("/delivery")}
            aria-label="Go to delivery menu"
          >
            <span>
              <i className="fas fa-utensils" style={{ marginRight: "8px" }}></i>
            </span>
            {t("menu")}
          </button>
        </li>
        <li className="p__opensans">
          <Link to="/#awards">{t("experience")}</Link>
        </li>
        <li className="p__opensans">
          <Link to="/#contact">{t("contact")}</Link>
        </li>
      </ul>
      {/*       <div className="app__navbar-login">
             <a href="#login" className="p__opensans">
          Uloguj se / Registracija
        </a> 
        <div />
        <a href="/" className="p__opensans">
          Rezervišite Sto
        </a>
      </div */}

      <div className="app__navbar-smallscreen">
        <GiHamburgerMenu
          color="#fff"
          fontSize={27}
          onClick={() => setToggleMenu(true)}
        />
        {toggleMenu && (
          <div className="app__navbar-smallscreen_overlay flex__center slide-bottom">
            <MdOutlineRestaurantMenu
              fontSize={27}
              className="overlay__close"
              onClick={() => setToggleMenu(false)}
            />
            <ul className="app__navbar-smallscreen_links">
              <li>
                <Link to="/#home" onClick={() => setToggleMenu(false)}>
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link to="/#about" onClick={() => setToggleMenu(false)}>
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link to="/delivery" onClick={() => setToggleMenu(false)}>
                  {t("menu")}
                </Link>
              </li>
              <li>
                <Link to="/#awards" onClick={() => setToggleMenu(false)}>
                  {t("experience")}
                </Link>
              </li>
              <li>
                <Link to="/#contact" onClick={() => setToggleMenu(false)}>
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
