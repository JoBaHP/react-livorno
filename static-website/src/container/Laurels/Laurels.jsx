import React from "react";
import { useTranslation } from "react-i18next";

import { SubHeading } from "../../components";
import { images, data } from "../../constants";
import "./Laurels.css";

const AwardCard = ({ award: { imgUrl, translationKeys } }) => {
  const { t } = useTranslation();
  const [titleKey, subtitleKey] = translationKeys;
  
  return (
    <div className="app__laurels_awards-card">
      <img src={imgUrl} alt="nagrade" />
      <div className="app__laurels_awards-card_content">
        <p className="p__cormorant" style={{ color: "#DCCA87" }}>
          {t(titleKey)}
        </p>
        <p className="p__opensans">{t(subtitleKey)}</p>
      </div>
    </div>
  );
};

const Laurels = () => {
  const { t } = useTranslation();
  
  return (
  <div className="app__bg app__wrapper section__padding" id="awards">
    <div className="app__wrapper_info">
      <SubHeading title={t("awards_title")} />
      <h1 className="headtext__cormorant">{t("foods.title")}</h1>

      <div className="app__laurels_awards">
        {data.awards.map((award, i) => (
          <AwardCard award={award} key={i} />
        ))}
      </div>
    </div>

    <div className="app__wrapper_img">
      <img src={images.laurels} alt="laurels_img" />
    </div>
  </div>
  );
};

export default Laurels;
