import React from "react";
import { useTranslation } from "react-i18next";

import { SubHeading } from "../../components";
import { images } from "../../constants";
import "@fortawesome/fontawesome-free/css/all.min.css";

const FindUs = () => {
  const { t } = useTranslation();
  
  return (
  <div className="app__bg app__wrapper section__padding" id="contact">
    <div className="app__wrapper_info">
      <SubHeading title={t("find_us")} />
      <h1 className="headtext__cormorant" style={{ marginBottom: "3rem" }}>
        {t("find_us_location")}
      </h1>
      <div className="app__wrapper-content">
        <p className="p__opensans">{t("find_us_address")}</p>
        <p
          className="p__cormorant"
          style={{ color: "#DCCA87", margin: "2rem 0" }}
        >
          {t("working_hours_short")}
        </p>
        <p className="p__opensans">{t("weekdays")}</p>
        <p className="p__opensans">{t("weekends")}</p>
      </div>
      <button
        type="button"
        className="custom__button"
        style={{ marginTop: "2rem" }}
      >
        <a
          href="https://www.google.com/maps/place/Livorno/@45.2405641,19.8122039,17z/data=!4m12!1m6!3m5!1s0x475b102f027dfc81:0x99b7651f319a4d51!2sLivorno!8m2!3d45.240545!4d19.8143887!3m4!1s0x475b102f027dfc81:0x99b7651f319a4d51!8m2!3d45.240545!4d19.8143887?hl=sr"
          target="_blank"
          style={{ display: "flex", alignItems: "center" }}
          rel="noreferrer"
        >
          <i
            className="fas fa-map-marker-alt"
            style={{ marginRight: "8px" }}
          ></i>
          {t("visit_us")}
        </a>
      </button>
    </div>

    <div className="app__wrapper_img">
      <img src={images.findus} alt="findus_img" />
    </div>
  </div>
  );
};

export default FindUs;
