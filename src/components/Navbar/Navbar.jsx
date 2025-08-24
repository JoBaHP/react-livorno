import React from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import Navlink from "./Navlink";
import images from "../../constants/images";
import "./Navbar.css";

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = React.useState(false);
  return (
    <nav className="app__navbar">
      <div className="app__navbar-logo">
        <img src={images.logo} alt="app__logo" />
      </div>
      <ul className="app__navbar-links">
        <li className="p__opensans">
          <Navlink to="/#home">Početna</Navlink>
        </li>
        <li className="p__opensans">
          <Navlink to="/#about">O nama</Navlink>
        </li>
        <li className="p__opensans">
          <Navlink to="/delivery">Poruči Online</Navlink>
        </li>
        <li className="p__opensans">
          <Navlink to="/#awards">Doživljaj</Navlink>
        </li>
        <li className="p__opensans">
          <Navlink to="/#contact">Kontakt</Navlink>
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
                <Navlink to="/#home" onClick={() => setToggleMenu(false)}>
                  Početna
                </Navlink>
              </li>
              <li>
                <Navlink to="/#about" onClick={() => setToggleMenu(false)}>
                  O nama
                </Navlink>
              </li>
              <li>
                <Navlink to="/delivery" onClick={() => setToggleMenu(false)}>
                  Poruči Online
                </Navlink>
              </li>
              <li>
                <Navlink to="/#awards" onClick={() => setToggleMenu(false)}>
                  Doživljaj
                </Navlink>
              </li>
              <li>
                <Navlink to="/#contact" onClick={() => setToggleMenu(false)}>
                  Kontakt
                </Navlink>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
