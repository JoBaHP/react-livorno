import React from "react";
import { useTranslation } from "react-i18next";

import { SubHeading } from "../../components";
import { images } from "../../constants";
import "./Header.css";

const Header = () => {
  const { t } = useTranslation();
  
  return (
  <div className="app__header app__wrapper section__padding" id="home">
    <div className="app__wrapper_info">
      <SubHeading title={t("authentic_recipe")} />
      <h1 className="app__header-h1">{t("unforgettable_taste")}</h1>
      <p className="p__opensans" style={{ margin: "2rem 0" }}>
        {t("header_description")}
      </p>
      <button
        type="button"
        className="custom__button"
        data-glf-cuid="b74b223c-5979-45d0-9b49-38f14d13c738"
        data-glf-ruid="d960494f-3f45-43fc-a6ad-02a493448ec0"
      >
        <span>
          {" "}
          <i className="fas fa-utensils" style={{ marginRight: "8px" }}></i>
        </span>
        {t("view_menu")}
      </button>
    </div>

    <div className="app__wrapper_img">
      <img src={images.welcome} alt="header_img" />
    </div>
  </div>
  );
};

export default Header;
