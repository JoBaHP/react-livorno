import React from "react";

//import { images } from "../../constants";
import "./AboutUs.css";

const AboutUs = () => (
  <div
    className="app__aboutus app__bg flex__center section__padding"
    id="about"
  >
    {/*     <div className="app__aboutus-overlay flex__center">
      <img src={images.G} alt="G_overlay" />
    </div> */}

    <div className="app__aboutus-content flex__center">
      <div className="app__aboutus-content_about">
        <h1 className="headtext__cormorant">Mi smo</h1>
        <img src={images.spoon} alt="about_spoon" className="spoon__img" />
        <p className="p__opensans">
          Porodično preduzeće, restoran Livorno, osnovano je u martu 2012.
          godine. Mi smo zaljubljeni u ono što radimo i radujemo se što ćemo sa
          vama podeliti ljubav prema gurmanskim jelima u našem restoranu koji se
          nalazi u Novom Sadu, u ulici Bulevar partrijarha Pavla 12.
        </p>
        <button type="button" className="custom__button">
          Više o Nama
        </button>
      </div>

      <div className="app__aboutus-content_knife flex__center">
        <img src={images.rollingpin} alt="about_rollingpin" />
      </div>

      <div className="app__aboutus-content_history">
        <h1 className="headtext__cormorant">Naša Istorija</h1>
        <img src={images.spoon} alt="about_spoon" className="spoon__img" />
        <p className="p__opensans">
          Koristeći samo sveže sastojke, u kombinaciji sa ljubaznom uslugom,
          restoran Livorno je vrlo brzo našao put ka uspehu, nudeći opušteno i
          jedinstveno iskustvo ručavanja. Restoran Livorno se ponosi odabirom
          samo prirodnih sastojaka, koristeći samo najbolje za pripremu
          najsvežijih jela.
        </p>
        <button type="button" className="custom__button">
          Više o nama
        </button>
      </div>
    </div>
  </div>
);

export default AboutUs;
