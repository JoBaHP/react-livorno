import React from "react";
import SubHeading from "../SubHeading/SubHeading";
import "./Newsletter.css";
import { useForm, ValidationError } from "@formspree/react";

const Newsletter = () => {
  const [state, handleSubmit] = useForm("mrgjrqbq");
  if (state.succeeded) {
    return <p style={{ color: "var(--color-golden)" }}>Thanks for joining!</p>;
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className="app__newsletter">
        <div className="app__newsletter-heading">
          <SubHeading title="Newsletter" />
          <h1 className="headtext__cormorant">Ostanimo u kontaktu</h1>
          <p className="p__opensans">I nikada ne propustite naše novosti!</p>
        </div>
        <div className="app__newsletter-input flex__center">
          <input
            name="name"
            id="name"
            type="text"
            placeholder="Unesite Vaše ime"
            required
          />
          <ValidationError prefix="Name" field="name" errors={state.errors} />

          <input
            name="phone"
            id="phone"
            type="tel"
            placeholder="Unesite Vaš broj telefona"
            required
          />
          <ValidationError prefix="Phone" field="phone" errors={state.errors} />

          <input
            name="email"
            id="email"
            type="email"
            placeholder="Unesite Vašu email adresu"
            required
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} />

          <textarea
            id="message"
            name="message"
            placeholder="Unesite Vašu poruku"
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
            Pošalji
          </button>
        </div>
      </div>
    </form>
  );
};

export default Newsletter;
