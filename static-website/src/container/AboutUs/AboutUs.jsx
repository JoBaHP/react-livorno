import React from "react";
import { useTranslation } from "react-i18next";

import { images } from "../../constants";
import "./AboutUs.css";

const AboutUs = () => {
  const { t } = useTranslation();
  return (
  <div
    className="app__aboutus app__bg flex__center section__padding"
    id="about"
  >
    <div className="app__aboutus-overlay flex__center">
      <img src={images.G} alt="G_overlay" />
    </div>

    <div className="app__aboutus-content flex__center">
      <div className="app__aboutus-content_about">
        <h1 className="headtext__cormorant">{t("our_story")}</h1>
        {/*         <img src={images.spoon} alt="about_spoon" className="spoon__img" /> */}
        <p className="p__opensans">{t("our_story_content")}</p>
        <button type="button" className="custom__button">{t("learn_more")}</button>
      </div>

      <div className="app__aboutus-content_knife flex__center">
        <img src={images.rollingpin} alt="about_rollingpin" />
      </div>

      <div className="app__aboutus-content_history">
        <h1 className="headtext__cormorant">{t("about_history_title")}</h1>
        <img src={images.spoon} alt="about_spoon" className="spoon__img" />
        <p className="p__opensans">{t("about_history_content")}</p>
        <button type="button" className="custom__button">{t("learn_more")}</button>
      </div>
    </div>
  </div>
);
};

export default AboutUs;
