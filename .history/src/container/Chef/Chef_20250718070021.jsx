import React from "react";

import { SubHeading } from "../../components";
//import { images } from "../../constants";
import "./Chef.css";

const Chef = () => (
  <div className="app__bg app__wrapper section__padding fix">
    {/*     <div className="app__wrapper_img app__wrapper_img-reverse">
      <img src={images.chef} alt="chef_image" />
    </div> */}
    <div className="app__wrapper_info">
      <SubHeading title="Chef's word" />
      <h1 className="headtext__cormorant">U šta mi verujemo</h1>

      <div className="app__chef-content">
        {/*         <div className="app__chef-content_quote">
          <img src={images.quote} alt="quote_image" />
          <p className="p__opensans">
            Timski duh, prijatna atmosfera i izvrsna hrana je naš moto .
          </p>
        </div> */}
        <p className="p__opensans">
          {" "}
          Kombinujemo samo sveže namirnice koje uz prepoznatljiva Italijanska
          ulja i brašna čine da naša jela istinski bude sva čula. U našem
          restoranu će vas dočekati prijatno osoblje iza kojeg stoji fantastičan
          tim iz naše kuhinje koji je zadužen za pripremu ovih ukusnih jela.
          <br /> Uverite se i sami!{" "}
        </p>
      </div>

      <div className="app__chef-sign">
        <p>Veselin R.</p>
        <p className="p__opensans">Chef & Founder</p>
        <img src={images.sign} alt="sign_image" />
      </div>
    </div>
  </div>
);

export default Chef;
