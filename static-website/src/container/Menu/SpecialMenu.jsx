import React from "react";
import { useTranslation } from "react-i18next";

import { SubHeading, MenuItem } from "../../components";
import { data, images } from "../../constants";
import "./SpecialMenu.css";

const SpecialMenu = () => {
  const { t } = useTranslation();
  
  return (
  <div className="app__specialMenu flex__center section__padding" id="menu">
    <div className="app__specialMenu-title">
      <SubHeading title={t("menu_for_all_tastes")} />
      <h1 className="headtext__cormorant">{t("featured_selection")}</h1>
    </div>

    <div className="app__specialMenu-menu">
      <div className="app__specialMenu-menu_wine  flex__center">
        <p className="app__specialMenu-menu_heading">{t("drinks_menu")}</p>
        <div className="app__specialMenu_menu_items">
          {data.wines.map((wine, index) => (
            <MenuItem
              key={wine.title + index}
              title={wine.title}
              price={wine.price}
              tags={wine.tags}
            />
          ))}
        </div>
      </div>

      <div className="app__specialMenu-menu_img">
        <img src={images.menu} alt="menu__img" />
      </div>

      <div className="app__specialMenu-menu_cocktails  flex__center">
        <p className="app__specialMenu-menu_heading">{t("popular_dishes")}</p>
        <div className="app__specialMenu_menu_items">
          {data.cocktails.map((cocktail, index) => (
            <MenuItem
              key={cocktail.title + index}
              title={cocktail.title}
              price={cocktail.price}
              tags={cocktail.tags}
            />
          ))}
        </div>
      </div>
    </div>

    <div style={{ marginTop: 15 }}>
      <button
        type="button"
        className="custom__button"
        data-glf-cuid="b74b223c-5979-45d0-9b49-38f14d13c738"
        data-glf-ruid="d960494f-3f45-43fc-a6ad-02a493448ec0"
      >
        {t("full_menu")}
      </button>
    </div>
  </div>
  );
};

export default SpecialMenu;
