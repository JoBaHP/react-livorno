import React from "react";
import { useTranslation } from "react-i18next";
import SubHeading from "../SubHeading/SubHeading";
import "./Newsletter.css";
import { useForm, ValidationError } from "@formspree/react";

const Newsletter = () => {
  const { t } = useTranslation();
  const [state, handleSubmit] = useForm("mrgjrqbq");
  if (state.succeeded) {
    return <p style={{ color: "var(--color-golden)" }}>{t("thanks_for_joining")}</p>;
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className="app__newsletter">
        <div className="app__newsletter-heading">
          <SubHeading title={t("newsletter")} />
          <h1 className="headtext__cormorant">{t("stay_in_touch")}</h1>
          <p className="p__opensans">{t("never_miss_news")}</p>
        </div>
        <div className="app__newsletter-input flex__center">
          <input
            name="name"
            id="name"
            type="text"
            placeholder={t("name_placeholder")}
            required
          />
          <ValidationError prefix="Name" field="name" errors={state.errors} />

          <input
            name="phone"
            id="phone"
            type="tel"
            placeholder={t("phone_placeholder")}
            required
          />
          <ValidationError prefix="Phone" field="phone" errors={state.errors} />

          <input
            name="email"
            id="email"
            type="email"
            placeholder={t("email_placeholder")}
            required
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} />

          <textarea
            id="message"
            name="message"
            placeholder={t("message_placeholder")}
            required
          />
          <ValidationError
            prefix="Message"
            field="message"
            errors={state.errors}
          />

          <button
            type="submit"
            className="custom__button"
            disabled={state.submitting}
          >
            {t("send")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Newsletter;
