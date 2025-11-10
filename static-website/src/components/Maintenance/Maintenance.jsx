import React from "react";
import "./Maintenance.css";

const Maintenance = () => {
  return (
    <div className="maintenance-overlay">
      <div
        className="app__topbar"
        style={{
          background: "var(--color-black)",
          color: "var(--color-white)",
          position: "absolute",
          top: 0,
          width: "inherit",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0.35rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            borderBottom: "1px solid var(--color-golden)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <a
              href="tel:+381611970198"
              style={{
                color: "var(--color-white)",
                textDecoration: "none",
                fontWeight: 600,
              }}
              aria-label="Call restaurant 061/197-0198"
            >
              TEL: 061/197-0198
            </a>
            <span style={{ opacity: 0.6, fontSize: 14 }}>
              Bulevar patrijarha Pavla 12, Novi Sad
            </span>
          </div>
        </div>
      </div>
      <div className="maintenance-content">
        <h1>Uskoro nova verzija sajta!</h1>
        <p>
          Radimo na integraciji sistema za online naručivanje. Nova verzija
          sajta će biti dostupna u najkraćem mogućem roku.
        </p>
        <p>Hvala na razumevanju!</p>
      </div>
    </div>
  );
};

export default Maintenance;
