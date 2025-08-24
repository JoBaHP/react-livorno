import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navlink = ({ to, children, onClick }) => {
  const location = useLocation();
  const hash = to.split("#")[1];

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    if (location.pathname === "/" && hash) {
      e.preventDefault();
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <Link to={to} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default Navlink;
